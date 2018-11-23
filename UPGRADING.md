# Upgrade Guide

This document describes breaking changes and how to upgrade. For a complete list of changes including minor and patch releases, please refer to the [changelog](CHANGELOG.md).

## v0.25.0

The error code parameter in the `DC_EVENT_ERROR` event is no longer emitted.

## v0.24.0

Options passed to `dc.configure()` no longer are in `snake_case` and must be updated to `camelCase`.

`deltachat-core` was updated to `v0.25.1` which contains the single folder approach. Use `options.imapFolder` if you need to change the name of this folder, which defaults to `'INBOX'`.

## v0.23.0

`Message#getMediainfo()` and `Message#setMediainfo()` was removed.

## v0.19.0

`DeltaChat#getInfo()` returns an object with parsed data from `dc_get_info()`, which can be used to display detailed information about software versions and the current configured state.

`Message#getType()` was renamed to `Message#getViewType()`. Just replace usage.

`MessageType` class was renamed to `MessageViewType`. Just replace type.

`DeltaChat#messageNew()` now accepts a `viewType` parameter. This is a step towards the caller to create messages and later do `dc.sendMessage(msg)` instead of using specific methods for sending e.g. video or audio, which now are deprecated in the core.

If `DeltaChat#sendTextMessage(chatId, text)` and similar methods are used, they should be replaced with a call to `DeltaChat#sendMessage(chatId, message)`, which means the correct `message` object needs to be constructed first, using `DeltaChat#messageNew(viewType)`.

The static method `DeltaChat.getConfig(path, cb)` was added to simplify getting configuration from a specific path. The desktop app should use this instead. It does a minimal open operation and doesn't set up threading and event polling.

`DeltaChat#setConfigInt()` and `DeltaChat#getConfigInt()` were removed. If these methods are used, they should instead switch to `DeltaChat#setConfig()` and `DeltaChat#getConfig()`.

`Message#setType()` was removed. Usage should be removed, since it's no longer possible to change the type of an existing message.

`DC_MSG_UNDEFINED` view type was removed and is no longer a valid message view type. Remove usage.
