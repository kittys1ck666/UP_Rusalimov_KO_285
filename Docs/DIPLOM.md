# Описание реализации практической части дипломного проекта

[ZIP-архив проекта](UP_CONDI_V5/tgbot_alert_prototype.zip)

## 1. Общая характеристика проекта

В проекте была реализована разработка системы оповещения и аутентификации пользователя для системы обнаружения образов огнестрельного оружия. Разработанный проект представляет собой Telegram-бота.

В ходе разработки были созданы:
- Telegram-бот для взаимодействия с пользователем;
- Механизмы регистрации и идентификации пользователей;
- Функции управления рабочими сменами;
- Система обработки и хранения уведомлений и тревог;
- Интерфейсы обмена данными между ботом и сервером;
- Структура хранения данных о пользователях и событиях.

## 2. Технологии и инструменты

### Основные технологии:
- **Python** — основной язык разработки;
- **aiogram** — библиотека для реализации Telegram-бота;
- **FastAPI** — фреймворк для построения серверной части и API;
- **Uvicorn** — сервер запуска FastAPI-приложения.

### Дополнительные инструменты:
- **Visual Studio Code** — среда разработки;
- **Telegram Bot API** — интерфейс интеграции с мессенджером Telegram.

Благодаря этому стеку технологий и инструментов, бот легко расширяется и переностится на другие соц.сети (Vkontakte/MAX)

## 3. Блок-схема структуры телеграм-бота

![Блок-схема](Docs/BlockSchemeImage/blocksheme_tgbot.png)

## 4. Реализация функционала телеграмм-бота

### 4.1 Регистрация в систему

Функция регистрации предназначена для того, чтобы сотрудники могли самостоятельно подключаться к системе оповещения без изменения исходного кода и ручного редактирования конфигурационных файлов. Регистрация осуществляется через команду вида: /register КОД_ОРГАНИЗАЦИИ

После ввода команды бот проверяет корректность указанного кода, сопоставляя его со справочником организаций, определённым в конфигурационном модуле. В случае успешной проверки создаётся новый профиль пользователя, включающий его Telegram ID, идентификатор организации и её наименование. Эти данные сохраняются в файл users.json, откуда впоследствии загружаются при старте приложения.
Реализация функции регистрации позволяет:
- однозначно идентифицировать пользователя в системе;
- привязать его к конкретной организации;
- использовать эту информацию при определении получателей тревог и формировании истории событий.

Функция регистрации в main.py

```py
@dp.message(Command("register"))
async def cmd_register(message: Message):
    """
    Регистрация пользователя с привязкой к организации по коду.
    Коды организаций задаются в ORGANIZATIONS (config.py).
    """
    parts = message.text.split(maxsplit=1)
    if len(parts) < 2:
        codes = ", ".join(ORGANIZATIONS.keys()) or "нет доступных кодов"
        await message.answer(
            "Для регистрации укажите код организации.\n"
            "Формат: <code>/register КОД</code>\n"
            f"Доступные коды: {codes}",
            reply_markup=shift_kb,
        )
        return

    code = parts[1].strip().upper()
    org = ORGANIZATIONS.get(code)
    if not org:
        await message.answer(
            "Неверный код организации.\n"
            "Проверьте код или обратитесь к администратору.",
            reply_markup=shift_kb,
        )
        return

    user_id = message.from_user.id

    # Если включён белый список — дополнительная защита
    if ALLOWED_TELEGRAM_IDS and user_id not in ALLOWED_TELEGRAM_IDS:
        await message.answer(
            "⛔ У вас нет доступа к этому боту.\n"
            "Обратитесь к администратору безопасности.",
            reply_markup=shift_kb,
        )
        return

    user = register_user(
        telegram_id=user_id,
        organization_id=org["id"],
        organization_name=org["name"],
    )

    await message.answer(
        f"Вы успешно зарегистрированы как сотрудник организации:\n"
        f"<b>{user.organization_name}</b>.\n\n"
        "Теперь отметьте выход на смену кнопкой ниже, "
        "чтобы начать получать тревоги.",
        reply_markup=shift_kb,)
```

Пользователи хранятся в JSON-виде в файле users.json
```json
[
  {
    "telegram_id": id,
    "organization_id": "org_id",
    "organization_name": "org_name",
    "on_shift": true/false
  }
]
```

### 4.2 Управление рабочей сменой

Функция управления сменой решает задачу разграничения времени, когда сотрудник должен получать тревожные уведомления, и когда он находится вне дежурства. Для этого в боте реализованы две основные команды, оформленные в виде кнопок:
- «Выйти на смену» – сотрудник начинает смену;
- «Закончить смену» – сотрудник завершает смену.
При нажатии на кнопку «Выйти на смену» для соответствующей записи пользователя в users.json устанавливается признак on_shift = true. Это означает, что при поступлении новой тревоги данный пользователь будет включён в список получателей уведомлений. Нажатие на кнопку «Закончить смену» изменяет статус на on_shift = false, и пользователь перестаёт получать новые тревоги до следующего выхода на смену.
На стороне серверной логики при обработке запроса POST /api/alerts система определяет получателей на основе двух критериев:
- принадлежность пользователя к той же организации, что указана в тревоге;
- наличие у пользователя статуса on_shift = true.
Если в данный момент ни один сотрудник нужной организации не находится на смене, уведомления не рассылаются, а тревога фиксируется со статусом «нет получателей». Такой подход позволяет избежать лишних уведомлений в нерабочее время и направлять тревоги только тем сотрудникам, которые действительно несут дежурство.
Обновленный функционал и логика отправки запросов тревог от системы в приложение А.

### 4.3 История трегов и уведомлений

Для анализа работы системы и контроля обработки событий была реализована функция просмотра истории тревожных уведомлений. Доступ к ней осуществляется через команду: /history.
При выполнении данной команды бот определяет организацию, к которой принадлежит пользователь, и выбирает из внутреннего хранилища все тревоги, связанные с этой организацией. Пользователю выводится список последних событий (например, десять последних тревог), содержащий краткую информацию по каждой записи: идентификатор тревоги, камеру-источник, тип угрозы, время события, статус и, при наличии, место возникновения.
Данная функция позволяет:
- просматривать, какие события ранее происходили на объекте;
- проверять, были ли подтверждены или отклонены конкретные тревоги;
- использовать историю для разборов инцидентов и формирования отчётности.
Таким образом, история тревог дополняет механизм оперативного оповещения возможностью ретроспективного анализа, что является важным элементом любой современной системы безопасности.

Команда /history в main.py

```py
@dp.message(Command("history"))
async def cmd_history(message: Message):
    
    user_id = message.from_user.id

    if not is_authorized(user_id):
        await message.answer(
            "⛔ У вас нет доступа к просмотру истории. Обратитесь к администратору."
        )
        return

    user = USERS.get(user_id)
    if not user:
        await message.answer(
            "Вы ещё не зарегистрированы в системе.\n"
            "Используйте команду вида:\n"
            "<code>/register КОД_ОРГАНИЗАЦИИ</code>"
        )
        return

    org_id = user.organization_id
    alerts_for_org = [
        a for a in ALERTS.values() if a.payload.organization_id == org_id
    ]
    if not alerts_for_org:
        await message.answer("Для вашей организации тревог пока нет.")
        return
    last_alerts = list(alerts_for_org)[-10:]
    last_alerts.reverse()

    lines: list[str] = []
    for a in last_alerts:
        lines.append(
            f"<b>ID:</b> <code>{a.id}</code>\n"
            f"<b>Камера:</b> {a.payload.device_id}\n"
            f"<b>Тип:</b> {a.payload.threat_type}\n"
            f"<b>Время:</b> {a.payload.timestamp}\n"
            f"<b>Статус:</b> {a.status}\n"
            f"<b>Локация:</b> {a.payload.location or '-'}\n"
            "— — —"
        )

    text = "🕓 История последних тревог вашей организации:\n\n" + "\n".join(lines)
    await message.answer(text)
```

### 4.4 Тестовый запрос

Команда /test отправляет тестовое тревожное уведомление пользователю и используется для демонстрации работы системы.

Команда /test в main.py

```py
@dp.message(Command("test"))
async def cmd_test(message: Message):
    """Отправка тестового тревожного уведомления в текущий чат."""
    user_id = message.from_user.id
    if not is_authorized(user_id):
        await message.answer(
            "⛔ У вас нет доступа к тестированию. Обратитесь к администратору."
        )
        return

    payload = AlertIn(
        device_id="demo-cam-1",
        timestamp="2025-11-11T18:23:00Z",
        image_url="https://i.pinimg.com/originals/ee/eb/2e/eeeb2e4163162858a9733aade3f8302b.jpg",
        confidence=0.88,
        threat_type="firearm",
        location="Демонстрационная зона",
    )
    alert_id = str(uuid.uuid4())
    alert = Alert(id=alert_id, payload=payload, status="queued")
    ALERTS[alert_id] = alert

    text = format_alert_text(payload.model_dump())
    await send_alert(bot, user_id, text, alert_id, payload.image_url)
    ALERTS[alert_id].status = "sent"
    await message.answer(
```

### 4.5 Обработчик тревог и уведомлений
Обработка тревоги осуществляется через HTTP-маршрут /api/alerts.
Система обнаружения оружия отправляет POST-запрос с JSON-структурой, содержащей данные о событии. Сервер принимает запрос, формирует объект тревоги и запускает функцию отправки уведомления пользователям.

Обработка тревоги в main.py

```py
@app.post("/api/alerts")
async def create_alert(payload: AlertIn):
    """Создание тревоги из внешней системы детекции."""
    alert_id = str(uuid.uuid4())
    alert = Alert(id=alert_id, payload=payload, status="queued")
    ALERTS[alert_id] = alert

    # определяем получателей: сначала все зарегистрированные пользователи,
    # если их нет - используем TELEGRAM_CHAT_ID как демонстрационный чат
    recipients: Set[int] = set()
    if REGISTERED_USERS:
        recipients = set(REGISTERED_USERS)
    elif TELEGRAM_CHAT_ID:
        recipients = {int(TELEGRAM_CHAT_ID)}

    if not recipients:
        raise HTTPException(
            status_code=500, detail="Нет ни одного получателя для уведомлений"
        )

    try:
        text = format_alert_text(payload.model_dump())
        for chat_id in recipients:
            await send_alert(bot, chat_id, text, alert_id, payload.image_url)
        ALERTS[alert_id].status = "sent"
    except Exception as e:
        ALERTS[alert_id].status = "failed"
        raise HTTPException(
            status_code=500, detail=f"Не удалось отправить уведомление: {e}"
        )

    return JSONResponse({"status": "queued", "alert_id": alert_id})
```

### 4.6 Отправка сообщений и изображений пользователю
Для отправки сообщений и изображений используется модуль telegram_utils.py.
Он формирует текст уведомления и прикрепляет inline-кнопки.

Формирование текста пользователю в telegram_utils.py.

```py
async def send_alert(
    bot: Bot, chat_id: int, text: str, alert_id: str, image_url: str | None = None
):
    kb = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="🟢 Подтвердить тревогу", callback_data=f"ack:{alert_id}"
                ),
                InlineKeyboardButton(
                    text="⚪ Ложная тревога", callback_data=f"false:{alert_id}"
                ),
            ]
        ]
    )

    if image_url:
        url = str(image_url)
        try:
            await bot.send_photo(chat_id, image_url, caption=text, reply_markup=kb)
            return
        except Exception as e:
            logger.exception(f"Не удалось отправить фото по адресу {image_url}: {e}")

    # если дошли сюда — либо image_url нет, либо send_photo упал
    await bot.send_message(chat_id, text, reply_markup=kb)

def format_alert_text(payload: dict) -> str:
    conf_pct = int(payload.get("confidence", 0) * 100)
    lines = [
        "📸 ТРЕВОГА! Обнаружено оружие!",
        f"📷 Камера: {payload.get('device_id')}",
        f"📍 Локация: {payload.get('location') or '-'}",
        f"🕒 Время: {payload.get('timestamp')}",
        f"🔍 Доверие модели: {conf_pct}%",
        f"🔫 Тип угрозы: {payload.get('threat_type')}",
    ]
    return "\n".join(lines)
```

### 4.7 Обработчик кнопок

Также в файле main.py реализуется отслеживает нажатие кнопок подтверждения или отклонения тревоги. Для этого используются callback-хэндлеры.

Сallback-хэндлеры в main.py.

```py
alert_id = query.data.split(":", 1)[1]
    alert = ALERTS.get(alert_id)
    if not alert:
        await query.answer("Событие не найдено", show_alert=True)
        return
    alert.status = "acknowledged"
    await query.message.answer(f"✅ Подтверждено оператором (alert_id={alert_id})")
    await query.answer("Принято")

@dp.callback_query(F.data.startswith("false:"))
async def on_false(query: CallbackQuery):
    user_id = query.from_user.id
    if not is_authorized(user_id):
        await query.answer("У вас нет прав для обработки тревоги.", show_alert=True)
        return
    alert_id = query.data.split(":", 1)[1]
    alert = ALERTS.get(alert_id)
    if not alert:
        await query.answer("Событие не найдено", show_alert=True)
        return
    alert.status = "false_positive"
    await query.message.answer(f"⚪ Отмечено как ложное (alert_id={alert_id})")
await query.answer("Отмечено")
```

## 5. Структура проекта
- main.py - основной серверный модуль, запускающий телеграм-бота и API-сервер;
- app/config.py – модуль конфигурации, содержащий параметры подключения, токены и переменные окружения;
- app/telegram_utils.py – модуль вспомогательных функций для формирования сообщений, кнопок и отправки изображений;
- app/schemas.py – модуль описания входных данных с помощью Pydantic-схем;
- app/main.py – обработчик HTTP-запросов, принимающий тревожные события от системы обнаружения оружия.





