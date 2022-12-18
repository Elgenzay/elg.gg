use std::path::{Path, PathBuf};

use rocket::fs::{relative, NamedFile};
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

#[rocket::launch]
fn rocket() -> _ {
	rocket::build()
		.mount("/", rocket::routes![static_pages])
		.attach(Shield::default().enable(Hsts::IncludeSubDomains(Duration::new(31536000, 0))))
}
