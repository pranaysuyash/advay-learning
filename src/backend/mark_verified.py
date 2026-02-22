import asyncio
from sqlalchemy.future import select
from app.db.session import async_session
from app.db.models.user import User

async def verify_user():
    async with async_session() as session:
        result = await session.execute(select(User).filter(User.email == "testparent@example.com"))
        user = result.scalars().first()
        if user:
            user.is_active = True
            user.email_verified = True
            await session.commit()
            print("User verified successfully")
        else:
            print("User not found")

if __name__ == "__main__":
    asyncio.run(verify_user())
