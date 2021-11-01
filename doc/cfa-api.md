It would be easier for me to parse and handle generally on the kiosk if you could combine all the authentication/authorization response information in a separate authorization JSON formatted object embedded in the general response.

For example here is the JSON sent in a currently valid handshake request:

```json
{
  "kiosk_id": "14d914c5-e5c9-4832-80dc-62cf5a56cf02",
  "credential": "xxxxxxxxxxxxxxxxx"
}
```

And the current response:

```json
{
  "message": "HTTP 200",
  "kiosk_id": "14d914c5-e5c9-4832-80dc-62cf5a56cf02",
  "credential": "xxxxxxxxxxxxxxxxx",
  "ip": "161.77.226.185"
}
```

I'm suggesting that the handshake response could instead just contain a nested authorization object that looks like this:

```json
{
  "authorization": {
    "code": 200,
    "message": "Kiosk id registered and credential is valid.",
    "kiosk_id": "14d914c5-e5c9-4832-80dc-62cf5a56cf02",
    "ip": "161.77.226.185"
  }
}
```

One improvement for me is dividing the current message attribute  into two parts:
1. code: identifies the server response, easily used on my end in switch/case statements.
2. message:  provides a brief readable description of the result.

Another is that this same authorization object form can be included in the responses to all the other types of requests -- that makes it much easier in my code handling these errors consistently.

Examples of different returned authorization objects corresponding to different problems.

1. The JSON sent by the request from the kiosk to the CfA backend is invalid/malformed.

This shouldn't happen and indicates an error in my code in the kiosk application. Also in this case the `kiosk_id` can't be returned because the JSON parsing of the request failed.

```json
"authorization": {
  "code": 400,
  "message": "JSON request is invalid/malformed.",
  "ip": "161.77.226.185"
}
```

2. The kiosk_id or the credential key:value pair are missing from the JSON sent in the request.

This also shouldn't happen and indicates an error in my code in the kiosk application.

```json
"authorization": {
  "code": 401,
  "message": "kiosk id or credential is missing from request",
  "kiosk_id": "14d914c5-e5c9-4832-80dc-62cf5a56cf02",
  "ip": "161.77.226.185"
}
```

3. The kiosk ID does not match any registered kiosk id in the CfA backend server.

This indicates the local admin user for the kiosk needs to register the kiosk and then follow up by adding a valid cfa key credential.

```json
"authorization": {
  "code": 402,
  "message": "Kiosk ID is not registered.",
  "kiosk_id": "14d914c5-e5c9-4832-80dc-62cf5a56cf02",
  "ip": "161.77.226.185"
}
```

4. This kiosk ID is registered but the credential is not valid because it is not the right length or includes characters that are not valid in a cfa key credential.

This indicates the local admin user for the kiosk might have made an error when adding the cfa key credential to the kiosk..

```json
"authorization": {
  "code": 403,
  "message": "Kiosk is registered but form of credential is invalid.",
  "kiosk_id": "14d914c5-e5c9-4832-80dc-62cf5a56cf02",
  "ip": "161.77.226.185"
}
```

5. This kiosk ID is registered but the credential is not valid for authorizing this kiosk id.

This indicates the local admin user for the kiosk might have made an error by adding an incorrect cfa key credential to the kiosk -- or that the CfA administrator has revoked the credential for this kiosk.

```json
"authorization": {
  "code": 404,
  "message": "Kiosk is registered but credential is invalid.",
  "kiosk_id": "14d914c5-e5c9-4832-80dc-62cf5a56cf02",
  "ip": "161.77.226.185"
}
```

6. The kiosk IP address does not match the IP address registered in the database registered for this kiosk id.

This indicates that the external IP address for this kiosk has changed since the kiosk was registered.

```json
"authorization": {
  "code": 405,
  "message": "Kiosk external IP address does not match IP address registered for this kiosk.",
  "kiosk_id": "14d914c5-e5c9-4832-80dc-62cf5a56cf02",
  "ip": "161.77.226.185"
}
```

--------

Here are examples of returning this same embedded authorization object in the JSON responses to other types of requests.

Response to successful observation request:

```json
{
  "authorization": {
    "code": 200,
    "message": "Kiosk id registered and credential is valid.",
    "kiosk_id": "14d914c5-e5c9-4832-80dc-62cf5a56cf02",
    "ip": "161.77.226.185"
  },
  "email": "stephen.bannasch@gmail.com",
  "observation_name": "Orion Nebula",
  "observation_id": "MW2",
  "datetime_when_user_made_request_at_kiosk": "2021-11-01T16:22:57.331Z"
}
```

Response to successful save-and-send image request:

```json
{
  "authorization": {
    "code": 200,
    "message": "Kiosk id registered and credential is valid.",
    "kiosk_id": "14d914c5-e5c9-4832-80dc-62cf5a56cf02",
    "ip": "161.77.226.185"
  },
  "datetime_when_user_made_request_at_kiosk": "2021-11-01T17:04:15.081Z",
  "email": "stephen.bannasch@gmail.com",
  "imageFilename": "m51-whirlpool-5b60a5bc-ee25-40ab-b637-f08cea8f6bd2.jpg",
  "activity_name": "Whirlpool Galaxy",
  "activity_path": "rgb/m51-whirlpool",
  "category_name": "What’s Red + Green + Blue?",
  "Email_msg": "Email Sent Successfully!",
  "record_message": "Information has been recorded",
  "message": "The file m51-whirlpool-5b60a5bc-ee25-40ab-b637-f08cea8f6bd2.jpg has been uploaded."
}
```

If there is an authorization error when an observation or save-and-send image request is made I think it makes sense to only include the authorization object embedded in the response.

Response to unsuccessful observation request due to an authorization error because the kiosk id is not registered:

```json
{
  "authorization": {
    "code": 402,
    "message": "Kiosk ID is not registered.",
    "kiosk_id": "14d914c5-e5c9-4832-80dc-62cf5a56cf02",
    "ip": "161.77.226.185"
  }
}
```

Response to unsuccessful save-and-send image request due to an authorization error:

```json
{
  "authorization": {
    "code": 402,
    "message": "Kiosk ID is not registered.",
    "kiosk_id": "14d914c5-e5c9-4832-80dc-62cf5a56cf02",
    "ip": "161.77.226.185"
  }
}
```

If the JSON anywhere in the observation or save-and-send request is invalid/malformed this authorization objects is returned as a response:

```json
{
  "authorization": {
    "code": 400,
    "message": "JSON request is invalid/malformed.",
    "ip": "161.77.226.185"
  }
}
```

If there are missing key:value pairs in the content of a successfully authorized observation or save-and-send image request, perhaps the same code and message form from the authorization object can be repurposed at the top level of the JSON response.

```json
{
  "authorization": {
    "code": 200,
    "message": "Kiosk id registered and credential is valid.",
    "kiosk_id": "14d914c5-e5c9-4832-80dc-62cf5a56cf02",
    "ip": "161.77.226.185"
  },
  "code": 401,
  "message": "Required fields missing from the request",
}
```

With a bit of work you could add in the names of the missing fields in the message value.
