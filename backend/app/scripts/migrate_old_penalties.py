"""
Migrate missing penalties from the old OW4 redwine_penalty table to
the new Vengeful Vineyard database.

Usage:
    # Dry run (default) — shows what would be migrated
    python -m app.scripts.migrate_old_penalties

    # Actually perform the migration
    python -m app.scripts.migrate_old_penalties --commit

Env vars:
    OLD_DB_URL  – connection string for the OW4 database
    NEW_DB_*    – connection params for the new database (from Doppler)
"""

from __future__ import annotations

import argparse
import sys
import uuid
from datetime import datetime

import psycopg2
import psycopg2.extras

# ── Committee → ow_group_id mapping ──────────────────────────────────────────

COMMITTEE_TO_OW_GROUP_ID: dict[str, str | None] = {
    "appKom": "appkom",
    "arrKom": "arrkom",
    "backlog": "backlog",
    "banKom": "bankom",
    "bedKom": "bedkom",
    "dotKom": "dotkom",
    "eksKom": "ekskom",
    "fagKom": "fagkom",
    "FeminIT": "feminit",
    "Hovedstyret": "hs",
    "itex": "itex",
    "jubKom": "jubkom",
    "Online-IL": "online-il",
    "proKom": "prokom",
    "seniorKom": None,  # No matching group in new DB
    "triKom": "trikom",
    "velKom": "velkom",
}

# ── Item → punishment type name ──────────────────────────────────────────────

ITEM_TO_TYPE_NAME: dict[str, str] = {
    "beer": "Ølstraff",
    "wine": "Vinstraff",
}


def build_user_map(
    old_conn: psycopg2.extensions.connection,
    new_conn: psycopg2.extensions.connection,
) -> dict[int, str]:
    """Map old user id → new user_id (UUID) via email."""
    with old_conn.cursor() as cur:
        cur.execute(
            "SELECT id, email FROM authentication_onlineuser "
            "WHERE email IS NOT NULL AND email != ''"
        )
        old_users = {row[0]: row[1].strip().lower() for row in cur.fetchall()}

    with new_conn.cursor() as cur:
        cur.execute("SELECT user_id, email FROM users WHERE email IS NOT NULL")
        new_users_by_email = {row[1].strip().lower(): str(row[0]) for row in cur.fetchall()}

    mapping: dict[int, str] = {}
    for old_id, email in old_users.items():
        new_id = new_users_by_email.get(email)
        if new_id:
            mapping[old_id] = new_id
    return mapping


def build_group_map(new_conn: psycopg2.extensions.connection) -> dict[str, str]:
    """Map ow_group_id → group_id (UUID)."""
    with new_conn.cursor() as cur:
        cur.execute(
            "SELECT ow_group_id, group_id FROM groups WHERE ow_group_id IS NOT NULL"
        )
        return {row[0]: str(row[1]) for row in cur.fetchall()}


def build_punishment_type_map(
    new_conn: psycopg2.extensions.connection,
) -> dict[tuple[str, str], str]:
    """Map (group_id, type_name) → punishment_type_id."""
    with new_conn.cursor() as cur:
        cur.execute("SELECT group_id, name, punishment_type_id FROM punishment_types")
        return {
            (str(row[0]), row[1]): str(row[2]) for row in cur.fetchall()
        }


def build_existing_legacy_set(
    new_conn: psycopg2.extensions.connection,
) -> set[tuple[str, str, str, int, str]]:
    """Load existing legacy penalties as a set of
    (user_id, group_id, created_at_str, amount, reason) for dedup."""
    with new_conn.cursor() as cur:
        cur.execute(
            "SELECT user_id, group_id, created_at, amount, reason "
            "FROM group_punishments WHERE legacy = true"
        )
        return {
            (str(r[0]), str(r[1]), r[2].isoformat(), r[3], r[4])
            for r in cur.fetchall()
        }


def main() -> None:
    parser = argparse.ArgumentParser(description="Migrate missing old penalties")
    parser.add_argument(
        "--commit", action="store_true", help="Actually perform the migration"
    )
    parser.add_argument(
        "--old-db-url",
        default="postgresql://dotkom:76ERNXdoKmOYikHLUoa+gwvYYXTHq28oLYqDpZBTMFo=@main-db.cxliesrki50e.eu-north-1.rds.amazonaws.com/onlineweb4?sslmode=require",
        help="Old OW4 database URL",
    )
    parser.add_argument("--new-db-host", default="localhost")
    parser.add_argument("--new-db-port", default="5433")
    parser.add_argument("--new-db-name", default="dev")
    parser.add_argument("--new-db-user", default="postgres")
    parser.add_argument("--new-db-password", default="postgres")
    args = parser.parse_args()

    dry_run = not args.commit
    if dry_run:
        print("=== DRY RUN (pass --commit to apply) ===\n")
    else:
        print("=== COMMITTING CHANGES ===\n")

    old_conn = psycopg2.connect(args.old_db_url)
    new_conn = psycopg2.connect(
        host=args.new_db_host,
        port=args.new_db_port,
        dbname=args.new_db_name,
        user=args.new_db_user,
        password=args.new_db_password,
    )

    # ── Build lookup maps ────────────────────────────────────────────────
    print("Building user map (email-based)...")
    user_map = build_user_map(old_conn, new_conn)
    print(f"  Mapped {len(user_map)} old users → new users")

    print("Building group map...")
    group_map = build_group_map(new_conn)  # ow_group_id → group_id
    print(f"  {len(group_map)} groups with ow_group_id")

    print("Building punishment type map...")
    ptype_map = build_punishment_type_map(new_conn)  # (group_id, name) → ptype_id

    print("Loading existing legacy penalties for dedup...")
    existing = build_existing_legacy_set(new_conn)
    print(f"  {len(existing)} existing legacy penalties\n")

    # ── Fetch all old penalties ──────────────────────────────────────────
    with old_conn.cursor() as cur:
        cur.execute(
            "SELECT id, to_id, giver_id, amount, committee, reason, date, "
            "deleted, item FROM redwine_penalty ORDER BY id"
        )
        old_penalties = cur.fetchall()
    print(f"Old DB has {len(old_penalties)} total penalty rows\n")

    # ── Counters ─────────────────────────────────────────────────────────
    migrated = 0
    skipped_no_user = 0
    skipped_no_group = 0
    skipped_no_ptype = 0
    skipped_exists = 0
    skipped_no_committee_mapping = 0
    users_not_found: set[int] = set()
    committees_not_found: set[str] = set()

    to_insert: list[tuple] = []

    for row in old_penalties:
        old_id, to_id, giver_id, amount, committee, reason, date, deleted, item = row

        # Map committee → group
        ow_group_id = COMMITTEE_TO_OW_GROUP_ID.get(committee)
        if ow_group_id is None:
            skipped_no_committee_mapping += 1
            committees_not_found.add(committee)
            continue

        group_id = group_map.get(ow_group_id)
        if not group_id:
            skipped_no_group += 1
            continue

        # Map user
        new_user_id = user_map.get(to_id)
        if not new_user_id:
            skipped_no_user += 1
            users_not_found.add(to_id)
            continue

        # Map punishment type
        type_name = ITEM_TO_TYPE_NAME.get(item)
        if not type_name:
            skipped_no_ptype += 1
            continue

        ptype_id = ptype_map.get((group_id, type_name))
        if not ptype_id:
            skipped_no_ptype += 1
            continue

        # Map giver
        new_giver_id = user_map.get(giver_id)  # None if not found

        # Dedup: check if this already exists
        created_at = date.replace(tzinfo=None) if date.tzinfo else date
        dedup_key = (new_user_id, group_id, created_at.isoformat(), amount, reason)
        if dedup_key in existing:
            skipped_exists += 1
            continue

        # Mark as existing to avoid inserting duplicates within this batch
        existing.add(dedup_key)

        paid = deleted  # deleted in old DB = paid in new DB
        punishment_id = str(uuid.uuid4())

        to_insert.append((
            punishment_id,
            group_id,
            new_user_id,
            ptype_id,
            reason,
            False,       # reason_hidden
            amount,
            created_at,
            new_giver_id,
            paid,
            created_at if paid else None,  # paid_at
            None,        # marked_paid_by
            True,        # legacy
        ))
        migrated += 1

    # ── Summary ──────────────────────────────────────────────────────────
    print("=== RESULTS ===")
    print(f"  Penalties to migrate:       {migrated}")
    print(f"  Already exist (skipped):    {skipped_exists}")
    print(f"  No user match (skipped):    {skipped_no_user}  ({len(users_not_found)} unique users)")
    print(f"  No committee mapping:       {skipped_no_committee_mapping}  {committees_not_found or ''}")
    print(f"  No group/ptype (skipped):   {skipped_no_group + skipped_no_ptype}")
    print()

    if not to_insert:
        print("Nothing to migrate.")
        old_conn.close()
        new_conn.close()
        return

    if dry_run:
        # Show per-group breakdown
        from collections import Counter
        group_counts: Counter[str] = Counter()
        for r in to_insert:
            group_counts[r[1]] += 1

        # Reverse lookup group_id → name
        with new_conn.cursor() as cur:
            cur.execute("SELECT group_id, name FROM groups")
            gid_to_name = {str(r[0]): r[1] for r in cur.fetchall()}

        print("Per-group breakdown of new penalties:")
        for gid, count in group_counts.most_common():
            print(f"  {gid_to_name.get(gid, gid):20s}: {count}")

        print(f"\nRe-run with --commit to apply {migrated} inserts.")
    else:
        print(f"Inserting {len(to_insert)} penalties...")
        with new_conn.cursor() as cur:
            psycopg2.extras.execute_batch(
                cur,
                """
                INSERT INTO group_punishments
                    (punishment_id, group_id, user_id, punishment_type_id,
                     reason, reason_hidden, amount, created_at, created_by,
                     paid, paid_at, marked_paid_by, legacy)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                to_insert,
                page_size=500,
            )
        new_conn.commit()
        print("Done! Migration committed.")

    old_conn.close()
    new_conn.close()


if __name__ == "__main__":
    main()
