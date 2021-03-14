from sqlalchemy.orm import Session

from app import models
from app import schemas


def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()


def get_user_by_name(db: Session, name: str):
    return db.query(models.User).filter(models.User.name == name).first()


def get_users(db: Session):
    return db.query(models.User).all()


def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(name=user.name)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def create_user_punishment(
    db: Session, punishment: schemas.PunishmentCreate, user_id: int, group_id: int
):
    db_punish = models.Punishment(
        reason=punishment.reason,
        givenTo_id=user_id,
        type=punishment.punishmentType_id,
        group_id=group_id,
    )
    db.add(db_punish)
    db.commit()
    db.refresh(db_punish)
    return db_punish


def get_group(db: Session, group_id: int):
    return db.query(models.Group).filter(models.Group.id == group_id).first()


def get_group_by_name(db: Session, name: str):
    return db.query(models.Group).filter(models.Group.name == name).first()


def get_groups(db: Session):
    return db.query(models.Group).all()


def create_group(db: Session, group: schemas.GroupCreate):
    db_group = models.Group(name=group.name, logoUrl=group.logoUrl)
    db.add(db_group)
    db.commit()
    db.refresh(db_group)
    return db_group


def add_user_to_group(db: Session, user: schemas.User, group: schemas.Group):
    db_link = models.UserGroupLink(user_id=user.id, group_id=group.id)
    db.add(db_link)
    db.commit()
    db.refresh(db_link)
    return db_link


def get_punishment_types(db: Session):
    return db.query(models.PunishmentType).all()


def create_punishment_type(
    db: Session, group_id: int, item: schemas.PunishmentTypeCreate
):
    db_item = models.PunishmentType(
        name=item.name, value=item.value, logoUrl=item.logoUrl, group_id=group_id
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item
