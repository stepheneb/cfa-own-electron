## Handshake

Request URL: https://waps.cfa.harvard.edu/microobservatory/own_kiosk/api/v1/handshake/handshake_dev.php
Request Method: POST

Source code: src/renderer/admin.js

```JSON
{
  "kiosk_id": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "credential": "xxxxxxxxxxxxxxxxx"
}
```

Response:

```JSON
{
  "authorization": {
    "code": 200,
    "message": "Kiosk credential successfully authenticated.",
    "kiosk_id": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "ip": "###.##.###.###"
  }
}
```

## Observation

Request URL: https://waps.cfa.harvard.edu/microobservatory/own_kiosk/api/v1/requests/telescope_dev.php
Request Method: POST

Source code: src/renderer/modules/render/observation.js

```JSON
{
  "kiosk_id":"xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "email":"username@mail.com",
  "observation_name":"Cigar Galaxy",
  "observation_id":"GA7",
  "datetime_when_user_made_request_at_kiosk":"2022-01-12T17:17:50.118Z",
  "credential":"xxxxxxxxxxxxxxxxx"
}
```

Response:

```JSON
{
  "authorization": {
    "code": 200,
    "message": "Image was successfully requested.",
    "kiosk_id": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "ip": "###.##.###.###"
  },
  "email": "username@mail.com",
  "observation_name": "Cigar Galaxy",
  "observation_id": "GA7",
  "datetime_when_user_made_request_at_kiosk": "2022-01-12T17:17:50.118Z"
}
```

## Save and Send Image

Request Url: https://waps.cfa.harvard.edu/microobservatory/own_kiosk/api/v1/emails/email_image_dev.php
Request Method: POST

Source code: src/renderer/modules/render/saveAndSend.js

```JSON
{
  "credential":"xxxxxxxxxxxxxxxxx",
  "email":"username@mail.com",
  "imageFilename":"m51-4b854247-9ed0-451b-a0b6-cc2c3c50fd29.jpg",
  "img_data":"data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgICAg ... eL/fHYjHYpKTJZPnU6//2Q==",
  "activity_name":"Whirlpool Galaxy",
  "category_name":"Reveal an Image using “Invisible Light”",
  "activity_path":"multi-wave/m51",
  "kiosk_id":"xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "datetime_when_user_made_request_at_kiosk":"2022-01-12T17:22:17.006Z"
}
```

Response:

```JSON
{
  "authorization": {
    "code": 200,
    "message": "The file m51-4b854247-9ed0-451b-a0b6-cc2c3c50fd29.jpg has been uploaded.",
    "kiosk_id": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "ip": "###.##.###.###"
  },
  "datetime_when_user_made_request_at_kiosk": "2022-01-12T17:22:17.006Z",
  "email": "username@mail.com",
  "imageFilename": "m51-4b854247-9ed0-451b-a0b6-cc2c3c50fd29.jpg",
  "activity_name": "Whirlpool Galaxy",
  "activity_path": "multi-wave/m51",
  "category_name": "Reveal an Image using “Invisible Light”",
  "Email_msg": "Email Sent Successfully!",
  "record_message": "Information has been recorded.",
  "message": "The file m51-4b854247-9ed0-451b-a0b6-cc2c3c50fd29.jpg has been uploaded."
}
```
