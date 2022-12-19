#[macro_use]
extern crate rocket;

use std::path::{Path, PathBuf};

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

#[catch(404)]
pub async fn not_found(req: &rocket::Request<'_>) -> Redirect {
	let path = PathBuf::from(req.uri().path().to_string());
	let mut new_uri = String::from("https://nginx.elg.gg");
	new_uri.push_str(&path.into_os_string().into_string().unwrap());
	Redirect::to(new_uri)
}

#[rocket::launch]
fn rocket() -> _ {
	rocket::build()
		.mount("/", rocket::routes![static_pages])
		.attach(Shield::default().enable(Hsts::IncludeSubDomains(Duration::new(31536000, 0))))
		.register("/", catchers![not_found])
}
