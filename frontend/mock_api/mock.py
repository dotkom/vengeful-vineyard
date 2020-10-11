import random
import string
from datetime import datetime

from aiohttp import web

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

PUNISHMENTS = [
    "Øl",
    "Vin",
    "Sprit",
    "Vaffel",
    "Kake",
    "Dworek",
    "Absithe",
    "Karaffel",
    "Ubetinget fengsel",
    "Gapestokk",
    "Betinget fengsel",
    "Pryling",
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
    price = random.randint(33, 500)
    if chance():
        verifiedBy = None
    else:
        verifiedBy = name()

    return {
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
    for _ in range(random.randint(0, 20)):
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
        "validPunishments": random.sample(PUNISHMENTS, 4),
    }


def randomUser():
    global UserID
    UserID += 1
    user = {
        "id": UserID,
        "name": name(),
        "punishments": randomPunishments(),
        "active": chance(75),
    }
    return user


def getUsers():
    users = []
    for _ in range(random.randint(10, 30)):
        users.append(randomUser())
    return users


async def getGroups(request):
    groups = []
    for _ in range(random.randint(3, 6)):
        groups.append(getGroup())
    return web.json_response(groups)


app = web.Application()
app.add_routes([web.get("/groups", getGroups)])
app.add_routes([web.static("/", "../public", show_index=True, append_version=True)])
web.run_app(app)
