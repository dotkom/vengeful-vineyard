import asyncio

from app.api.init_api import asgi_app


async def main() -> None:
    await asgi_app.router.startup()
    try:
        app = asgi_app

        ow_users = await app.http.get_all_ow_users()
        if not ow_users:
            return

        db_result = await app.db.users.get_all_raw()
        db_users = db_result["users"]

        async with app.db.pool.acquire() as conn:
            for db_user in db_users:
                email = db_user.get("email")
                ow_user = next(
                    (ow_user for ow_user in ow_users if ow_user.email == email), None
                )

                if not ow_user:
                    continue

                await conn.execute(
                    """UPDATE users
                    SET ow_user_id = $1
                    WHERE user_id = $2""",
                    ow_user.id,
                    str(db_user.get("user_id")),
                )

                await conn.execute(
                    """UPDATE group_members
                    SET ow_group_user_id = $1
                    WHERE user_id = $2""",
                    ow_user.id,
                    str(db_user.get("user_id")),
                )

    finally:
        await asgi_app.router.shutdown()


if __name__ == "__main__":
    asyncio.run(main())
