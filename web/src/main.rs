#[macro_use]
extern crate rocket;

use std::path::{Path, PathBuf};

use reqwest::StatusCode;
use rocket::fs::relative;
use rocket::fs::NamedFile;
use rocket::response::Redirect;
use rocket::shield::Hsts;
use rocket::shield::Shield;
use rocket::time::Duration;

#[rocket::get("/<path..>")]
pub async fn static_pages(path: PathBuf) -> Option<NamedFile> {
	let mut path = Path::new(relative!("static")).join(path);
	if path.is_dir() {
		path.push("index.html");
	}
	NamedFile::open(path).await.ok()
}

#[rocket::get("/i/<path..>")]
pub async fn i_redirect(path: PathBuf) -> Redirect {
	let path = path.into_os_string().into_string().unwrap();
	let mut new_uri = "https://i.elg.gg/".to_string();
	new_uri.push_str(&path[..]);
	Redirect::to(new_uri)
}

#[catch(404)]
pub async fn not_found(req: &rocket::Request<'_>) -> Result<NamedFile, Redirect> {
	let client = reqwest::Client::new();
	let path = PathBuf::from(req.uri().path().to_string())
		.into_os_string()
		.into_string()
		.unwrap();
	let mut new_uri = "https://nginx.elg.gg".to_string();
	new_uri.push_str(&path[..]);
	match client.get(&new_uri).send().await {
		Ok(resp) => {
			if let StatusCode::NOT_FOUND = resp.status() {
				let mut new_uri = "https://i.elg.gg".to_string();
				new_uri.push_str(&path[..]);
				match client.get(&new_uri).send().await {
					Ok(resp) => {
						if let StatusCode::NOT_FOUND = resp.status() {
							Ok(
								NamedFile::open(Path::new(relative!("static")).join("404.html"))
									.await
									.unwrap(),
							)
						} else {
							Err(Redirect::to(new_uri))
						}
					}
					Err(_) => panic!(),
				}
			} else {
				Err(Redirect::to(new_uri))
			}
		}
		Err(_) => panic!(),
	}
}

#[catch(500)]
pub async fn internal_server_error() -> NamedFile {
	NamedFile::open(Path::new(relative!("static")).join("500.html"))
		.await
		.unwrap()
}

#[rocket::launch]
fn rocket() -> _ {
	rocket::build()
		.mount("/", rocket::routes![static_pages, i_redirect])
		.attach(Shield::default().enable(Hsts::IncludeSubDomains(Duration::new(31536000, 0))))
		.register("/", catchers![not_found, internal_server_error])
}
