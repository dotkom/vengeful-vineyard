from typing import Any, Iterable, Optional, Union

DictOrList = Union[dict[Any, Any], list[Any]]


def suppress_keys(
    dictionary: DictOrList, new_value: Any, keys: Iterable[str], _outer: bool = True
) -> Optional[DictOrList]:
    if isinstance(dictionary, dict):
        for key, value in dictionary.items():
            if key in keys:
                dictionary[key] = new_value
            elif isinstance(value, (dict, list)):
                suppress_keys(value, new_value, keys, _outer=False)
    elif isinstance(dictionary, list):
        for item in dictionary:
            suppress_keys(item, new_value, keys, _outer=False)

    if _outer:
        return dictionary

    return None


def suppress_defaults(dictionary: DictOrList) -> Optional[DictOrList]:
    return suppress_keys(
        dictionary,
        "",
        (
            "id",
            "user_id",
            "group_id",
            "punishment_id",
            "punishment_type_id",
            "punishment_reaction_id",
            "group_event_id",
            "created_by",
            "marked_paid_by",
            "event_id",
        ),
    )


def suppress_compare(input1: DictOrList, input2: DictOrList) -> None:
    assert suppress_defaults(input1) == suppress_defaults(input2)
