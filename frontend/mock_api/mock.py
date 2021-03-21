#!/usr/bin/python
# -*- coding: utf-8 -*-

import random
import string
from datetime import datetime

from aiohttp import web, BasicAuth, ClientSession

GROUPIMAGES = {
    "Dotkom": "https://i.ibb.co/tJrB8kn/dotkom.png",
    "Arrkom": "https://i.ibb.co/pWdSC2w/arrkom.png",
    "Bedkom": "https://i.ibb.co/ysj3J4b/bedkom.png",
    "Bankkom": "https://i.ibb.co/7n3sVmK/bankom.png",
}

FIRST_NAMES = [
    "Anne",
    "Inger",
    "Kari",
    "Marit",
    "Ingrid",
    "Liv",
    "Maria",
    "Eva",
    "Ida",
    "Anna",
    "Hilde",
    "Nina",
    "Marianne",
    "Elisabeth",
    "Berit",
    "Kristin",
    "Astrid",
    "Bente",
    "Randi",
    "Bjørg",
    "Solveig",
    "Heidi",
    "Silje",
    "Hanne",
    "Monika",
    "Linda",
    "Tone",
    "Anita",
    "Elin",
    "Tove",
    "Wenche",
    "Camilla",
    "Julie",
    "Hege",
    "Ragnhild",
    "Ellen",
    "Vigdis",
    "Mona",
    "Ann",
    "Gerd",
    "Marie",
    "Karin",
    "Monica",
    "Emma",
    "Kristine",
    "Aud",
    "Helene",
    "Stine",
    "Laila",
    "Mari",
    "Thea",
    "Nora",
    "Turid",
    "Else",
    "Emilie",
    "Sara",
    "Line",
    "Sissel",
    "Malin",
    "Åse",
    "Lene",
    "Jorunn",
    "Trine",
    "Reidun",
    "Grethe",
    "Unni",
    "Gunn",
    "Grete",
    "May",
    "Lise",
    "Anette",
    "Sofie",
    "Linn",
    "Siri",
    "Cecilie",
    "Marte",
    "Vilde",
    "Eli",
    "Irene",
    "Gro",
    "Amalie",
    "Frida",
    "Kjersti",
    "Andrea",
    "Kirsten",
    "Martine",
    "Britt",
    "Janne",
    "Karoline",
    "Jenny",
    "Elise",
    "Siv",
    "Hanna",
    "Ruth",
    "Sigrid",
    "Ingeborg",
    "Mia",
    "Tonje",
    "Lena",
    "Rita",
    "Maren",
    "Cathrine",
]
LAST_NAMES = [
    "Hansen",
    "Johansen",
    "Olsen",
    "Larsen",
    "Andersen",
    "Pedersen",
    "Nilsen",
    "Kristiansen",
    "Jensen",
    "Karlsen",
    "Johnsen",
    "Pettersen",
    "Eriksen",
    "Berg",
    "Haugen",
    "Hagen",
    "Johannessen",
    "Andreassen",
    "Jacobsen",
    "Dahl",
    "Jørgensen",
    "Henriksen",
    "Lund",
    "Halvorsen",
    "Sørensen",
    "Jakobsen",
    "Moen",
    "Gundersen",
    "Iversen",
    "Strand",
    "Solberg",
    "Svendsen",
    "Eide",
    "Knutsen",
    "Martinsen",
    "Paulsen",
    "Bakken",
    "Kristoffersen",
    "Mathisen",
    "Lie",
    "Amundsen",
    "Nguyen",
    "Rasmussen",
    "Ali",
    "Lunde",
    "Solheim",
    "Berge",
    "Moe",
    "Nygård",
    "Bakke",
    "Kristensen",
    "Fredriksen",
    "Holm",
    "Lien",
    "Hauge",
    "Christensen",
    "Andresen",
    "Nielsen",
    "Knudsen",
    "Evensen",
    "Sæther",
    "Aas",
    "Myhre",
    "Hanssen",
    "Ahmed",
    "Haugland",
    "Thomassen",
    "Sivertsen",
    "Simonsen",
    "Danielsen",
    "Berntsen",
    "Sandvik",
    "Rønning",
    "Arnesen",
    "Antonsen",
    "Næss",
    "Vik",
    "Haug",
    "Ellingsen",
    "Thorsen",
    "Edvardsen",
    "Birkeland",
    "Isaksen",
    "Gulbrandsen",
    "Ruud",
    "Aasen",
    "Strøm",
    "Myklebust",
    "Tangen",
    "Ødegård",
    "Eliassen",
    "Helland",
    "Bøe",
    "Jenssen",
    "Aune",
    "Mikkelsen",
    "Tveit",
    "Brekke",
    "Abrahamsen",
    "Madsen",
]

UserID = -1
GroupID = -1
PunishmentID = -1

PUNISHMENTS = [
    {"id": 1, "name": "Øl"},
    {"id": 2, "name": "Vin"},
    {"id": 3, "name": "Sprit"},
    {"id": 4, "name": "Vaffel"},
    {"id": 5, "name": "Kake"},
    {"id": 6, "name": "Dworek"},
    {"id": 7, "name": "Absithe"},
    {"id": 8, "name": "Karaffel"},
    {"id": 9, "name": "Ubetinget fengsel"},
    {"id": 10, "name": "Gapestokk"},
    {"id": 11, "name": "Betinget fengsel"},
    {"id": 12, "name": "Pryling"},
    {"id": 13, "name": "Vanntortur"},
    {"id": 14, "name": "Pisking"},
    {"id": 15, "name": "Kokes levende"},
    {"id": 16, "name": "Syrebad"},
    {"id": 17, "name": "Brennmerking"},
    {"id": 18, "name": "Flåing"},
]


def chance(percent=50):
    return random.randrange(100) < percent


def name():
    if chance(30):
        return random.choice(FIRST_NAMES) + " " + random.choice(LAST_NAMES)
    return (
        random.choice(FIRST_NAMES)
        + "-"
        + random.choice(FIRST_NAMES)
        + " "
        + random.choice(LAST_NAMES)
    )


def randomWord(length=10):
    return "".join(random.choice(string.ascii_lowercase) for _ in range(length))


def randomDate():
    date = random.randint(1577836800, 1609372800)
    return datetime.fromtimestamp(date).isoformat()


def randomWords(total=3):
    return " ".join(randomWord(random.randint(1, 8)) for _ in range(total))


def punishmentType(amount):
    if amount < 100:
        return "assets/beer.svg"
    if amount < 300:
        return "assets/wine.svg"
    return "assets/vodka.svg"


def randomPunishment():
    global PunishmentID
    PunishmentID += 1
    price = random.randint(33, 500)
    if chance(25):
        verifiedBy = name()
    else:
        verifiedBy = None

    return {
        "id": PunishmentID,
        "imageurl": punishmentType(price),
        "price": price,
        "reason": randomWords(random.randint(3, 15)),
        "verifiedBy": verifiedBy,
        "verifiedTime": randomDate(),
        "givenBy": name(),
        "givenTime": randomDate(),
    }


def randomPunishments():
    punishments = []
    for _ in range(random.randint(0, 10)):
        punishments.append(randomPunishment())
    return sorted(punishments, key=lambda x: x["givenTime"], reverse=True)


def getGroup():
    global GroupID
    GroupID += 1
    name = random.choice(list(GROUPIMAGES.keys()))

    return {
        "id": GroupID,
        "name": f"{name}-{GroupID}",
        "rulesUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "users": getUsers(),
        "logoUrl": GROUPIMAGES[name],
        "punishmentTypes": random.sample(PUNISHMENTS, 10),
    }


def randomUser():
    global UserID
    UserID += 1
    punishments = randomPunishments()
    debt = sum(p["price"] for p in punishments if p["verifiedBy"] is None)
    totalPaid = sum(p["price"] for p in punishments if p["verifiedBy"] is not None)
    user = {
        "id": UserID,
        "name": name(),
        "punishments": punishments,
        "debt": debt,
        "totalPaid": totalPaid,
        "active": chance(75),
    }
    return user


def getUsers():
    users = []
    for _ in range(random.randint(10, 30)):
        users.append(randomUser())
    return users


async def getGroups(request):
    #admin = BasicAuth('admin', 'admin')
    async with ClientSession() as session:
        async with session.get("http://localhost:8888/group") as resp:
            r = await resp.json()
            return web.json_response(r)
    #groups = []
    #for _ in range(random.randint(3, 6)):
    #    groups.append(getGroup())
    #return web.json_response(groups)

async def acceptAndReflect(request):
    data = await request.text()
    print(request)
    print(data)
    return web.json_response(data)


app = web.Application()
app.add_routes([web.get("/groups", getGroups)])
app.add_routes([web.post("/punishment", acceptAndReflect)])
app.add_routes([web.post("/validatePunishment/{number}", acceptAndReflect)])
app.add_routes([web.delete("/validatePunishment/{number}", acceptAndReflect)])
app.add_routes([web.static("/", "../public", show_index=True, append_version=True)])
web.run_app(app)
