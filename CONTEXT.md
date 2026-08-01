# Habit Tracking

This context describes personal habits and the evidence used to record their completion.

## Language

**Owner**:
The sole person who creates habits and records their completion in this application.
_Avoid_: User, member, account

**Habit**:
A personal behavior the Owner intends to prove on calendar dates. It has no start date, end date, or schedule.
_Avoid_: Task, goal, routine

**Habit Identifier**:
The immutable filename slug that associates a Habit with all of its Proof Records. A deleted Habit can recover its retained Proof Records by being recreated with the same identifier.
_Avoid_: Habit name, title, label

**Proof Record**:
The record of one Habit on one calendar date, represented by its own Markdown file. It is valid only when it contains at least one Proof Image; the first is its calendar thumbnail.
_Avoid_: Check-in, entry, completion file

**Proof Image**:
A publicly viewable image submitted by the Owner as evidence that a habit was completed on a particular date.
_Avoid_: Image, photo, attachment
