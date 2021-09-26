---
title: Generating SSL Certificate on macOS
date: 2017-02-03T21:38:00+02:00
categories: [tutorial]
tags: [macos]
---
Even when you develop your website locally, sometimes you still need to access it through an HTTPS connection. These are 4 simple steps to generate an SSL certificate on your macOS. In this example, I'm using my Nginx installation directory to store the generated files: `/usr/local/etc/nginx`.

### 1. Generate The Private Key

Step one it to generate an RSA private key:

```bash
$ openssl genrsa -out /usr/local/etc/nginx/ssl/test.dev/private.key 2048
```

### 2. Generate Certificate Request

Step two is to generate a new certificate request:

```bash
openssl req -new -subj "/C=/ST=/O=/localityName=/commonName=test.dev/organizationalUnitName=/emailAddress=/" -key /usr/local/etc/nginx/ssl/test.dev/private.key -out /usr/local/etc/nginx/ssl/test.dev/certsignreq.csr -passin pass:
```

### 3. Generate The Certificate

Step three is to actually generate the certificate:

```
openssl x509 -req -days 365 -in /usr/local/etc/nginx/ssl/test.dev/certsignreq.csr -signkey /usr/local/etc/nginx/ssl/test.dev/private.key -out /usr/local/etc/nginx/ssl/test.dev/certificate.crt
```

### 4. Trust The Certificate

Finally, add the generated certificate to the System Keychain:

```bash
sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain /usr/local/etc/nginx/ssl/test.dev/certificate.crt
```
