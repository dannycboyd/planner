#Using CORS with angular 10 and a rust actix-web 3 server
I ran into this issue recently, where running dev versions of my Angular app, I couldn't make xhr requests to my dev server.
I started out following the examples set for Angular, using the `HttpClientModule`. I was following the guide located [here](https://angular.io/guide/http)

Once I got my request functions written, I decided to give it a shot.
```
get() {
  return this.http.get('localhost:8080/item/all');
}
```
Launching my service and webapp, calling this function returned a cryptic error.

`Error: Unknown Error, code 0`

Some cursory googling indicated this was a CORS issue. Some more googling turned up `actix-cors`, the middleware library I needed to setup the CORS headers on my service. I set it up using the example [here](https://github.com/actix/examples/tree/master/web-cors) according the backend project.

```
App::new()
  .wrap(
    Cors::new()
      .allowed_origin('http://localhost:4200')
      .allowed_methods(vec!["OPTIONS", "GET", "POST", "DELETE"])
      .allowed_headers(vec![header::AUTHORIZATION, header::ACCEPT])
      .allowed_header(header::CONTENT_TYPE)
      .max_age(3600)
      .finish(),
  )
```
I'm not certain if it's necessary, but I added the OPTIONS method as well as the DELETE method, which I know for sure I will need. As well added the authorization and accept headers, which will be useful in the future. I believe the rest is relatively straight forward. 

The error didn't change. After fiddling with it, trying the `.send_wildcard()` option in place of the `.allowed_origin()` option, nothing changed the error. I learned how to use curl to test an endpoint preflight request:

```
curl -X OPTIONS \
  http://localhost:8080/item \
  -H 'Access-Control-Request-Method: GET' \
  -H 'Cache-Control: no-cache' \
  -H 'Content-Type: application/json' \
  -H 'Origin: http://localhost:4200'
}'
```

After chasing my tail for two hours, I finally figured out what was going on: my request URL didn't have a protocol set in it. Chrome delivered a useful error message, indicating the allowed protocols included http and https, so I modified the get function above
```
get() {
  return this.http.get('http://localhost:8080/item/all');
}
```

and the request goes through properly. I wish that the error message would specifically state: "Unknown protocol requires CORS set, allowed protocols..." or something to that effect. I sort of assumed that the Angular http client would do that for me, but I suppose such hope is misplaced.