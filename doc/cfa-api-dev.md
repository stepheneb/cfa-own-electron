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
  "kiosk_id": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "email": "username@mail.com",
  "observation_name": "Moon",
  "observation_id": "SS1",
  "datetime_when_user_made_request_at_kiosk": "2022-01-13T20:49:40.179Z",
  "touch_begin": "2022-01-13T20:38:53.314Z",
  "credential": "xxxxxxxxxxxxxxxxx"
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
	"observation_name": "Moon",
	"observation_id": "SS1",
	"datetime_when_user_made_request_at_kiosk": "2022-01-13T20:49:40.179Z"
}
```

### Possible Errors

A response with  `authorization.code == 200` means the CfA API successfully received and processed the data sent in the POST request.

Other `authorization.code` values indicate errors.

```
"authorization": {
  "code": 407,
  "message": "You Already requested this image.",
  "kiosk_id": "14d914c5-e5c9-4832-80dc-62cf5a56cf02",
  "ip": "161.77.226.185"
}
```

## Save and Send Image

Request Url: https://waps.cfa.harvard.edu/microobservatory/own_kiosk/api/v1/emails/email_image_dev.php

Request Method: POST

Source code: src/renderer/modules/render/saveAndSend.js

```JSON
{
  "credential": "xxxxxxxxxxxxxxxxx",
  "email": "username@mail.com",
  "imageFilename": "heic2007a-bba8cf8b-aea6-417f-9162-789d31fa89fb.jpg",
  "img_data": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAA ... DbNNmkjVL/9k=",
  "activity_name": "Cosmic Reef Nebulas",
  "category_name": "What’s Red + Green + Blue?",
  "activity_path": "rgb/heic2007a",
  "kiosk_id": "14d914c5-e5c9-4832-80dc-62cf5a56cf02",
  "touch_begin": "2022-01-13T20:38:53.314Z",
  "datetime_when_user_made_request_at_kiosk": "2022-01-13T20:40:19.568Z"
}
```

Response:

```JSON

{
	"authorization": {
		"code": 200,
		"message": "The file heic2007a-bba8cf8b-aea6-417f-9162-789d31fa89fb.jpg has been uploaded.",
		"kiosk_id": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
		"ip": "###.##.###.###"
	},
	"datetime_when_user_made_request_at_kiosk": "2022-01-13T20:40:19.568Z",
	"email": "username@mail.com",
	"imageFilename": "heic2007a-bba8cf8b-aea6-417f-9162-789d31fa89fb.jpg",
	"activity_name": "Cosmic Reef Nebulas",
	"activity_path": "rgb/heic2007a",
	"category_name": "What’s Red + Green + Blue?",
	"Email_msg": "Email Sent Successfully!",
	"record_message": "Information has been recorded.",
	"message": "The file heic2007a-bba8cf8b-aea6-417f-9162-789d31fa89fb.jpg has been uploaded."
}
```
