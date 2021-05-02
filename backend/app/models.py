from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import backref, relationship
from sqlalchemy.sql import func

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    active = Column(Boolean, default=True)
    groups = relationship("Group", secondary="usergrouplink")
    punishments = relationship("Punishment", foreign_keys="Punishment.givenTo_id")
    debt = Column(Integer, default=0)
    totalPaid = Column(Integer, default=0)


class Group(Base):
    __tablename__ = "groups"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    logoUrl = Column(String)
    members = relationship("User", secondary="usergrouplink")
    punishmentTypes = relationship(
        "PunishmentType", foreign_keys="PunishmentType.group_id"
    )


class UserGroupLink(Base):
    __tablename__ = "usergrouplink"
    group_id = Column(Integer, ForeignKey("groups.id"), primary_key=True)
    group = relationship(Group, backref=backref("user_assoc"))
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    user = relationship(User, backref=backref("group_assoc"))
    admin = Column(Boolean, default=False)


class Punishment(Base):
    __tablename__ = "punishments"

    id = Column(Integer, primary_key=True, index=True)
    reason = Column(String)
    givenBy_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    givenTo_id = Column(Integer, ForeignKey("users.id"))
    group_id = Column(Integer, ForeignKey("groups.id"))
    givenTime = Column(DateTime, server_default=func.now())
    verifiedBy_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    verifiedTime = Column(DateTime, nullable=True)
    type_id = Column(Integer, ForeignKey("punishment_types.id"))


class PunishmentType(Base):
    __tablename__ = "punishment_types"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)
    value = Column(Integer)
    logoUrl = Column(String)
    group_id = Column(Integer, ForeignKey("groups.id"))
