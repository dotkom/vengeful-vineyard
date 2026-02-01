"""
Script to backfill inactive_at dates for existing inactive members.

This script fetches the actual membership end dates from OW API
for all inactive members in OW groups and updates their inactive_at field.
"""

import asyncio

from app.api.init_api import asgi_app


async def main() -> None:
    await asgi_app.router.startup()
    try:
        app = asgi_app

        # Get all OW groups
        async with app.db.pool.acquire() as conn:
            ow_groups = await conn.fetch(
                "SELECT group_id, ow_group_id FROM groups WHERE ow_group_id IS NOT NULL"
            )

        print(f"Found {len(ow_groups)} OW groups to process")

        total_updated = 0

        for group in ow_groups:
            group_id = group["group_id"]
            ow_group_id = group["ow_group_id"]

            print(f"\nProcessing group: {ow_group_id}")

            # Fetch members from OW API
            ow_members = await app.http.get_ow_group_users(ow_group_id)

            if not ow_members:
                print(f"  No members found in OW for {ow_group_id}")
                continue

            # Create lookup by ow_group_user_id
            ow_member_map = {m.id: m for m in ow_members}

            # Get inactive members from our database
            async with app.db.pool.acquire() as conn:
                inactive_members = await conn.fetch(
                    """SELECT user_id, ow_group_user_id
                       FROM group_members
                       WHERE group_id = $1 AND active = FALSE""",
                    group_id,
                )

            if not inactive_members:
                print(f"  No inactive members in database for {ow_group_id}")
                continue

            print(f"  Found {len(inactive_members)} inactive members in database")

            # Update inactive_at for each member with actual membership_end from OW
            updated_count = 0
            async with app.db.pool.acquire() as conn:
                for member in inactive_members:
                    ow_user_id = member["ow_group_user_id"]
                    user_id = member["user_id"]

                    ow_member = ow_member_map.get(ow_user_id)
                    if ow_member and ow_member.membership_end:
                        await conn.execute(
                            """UPDATE group_members
                               SET inactive_at = $1
                               WHERE group_id = $2 AND user_id = $3""",
                            ow_member.membership_end,
                            group_id,
                            user_id,
                        )
                        updated_count += 1

            print(f"  Updated {updated_count} members with actual membership end dates")
            total_updated += updated_count

        print(f"\n\nTotal updated: {total_updated} inactive members")

    finally:
        await asgi_app.router.shutdown()


if __name__ == "__main__":
    asyncio.run(main())
