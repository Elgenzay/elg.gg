use rocket::{
	response::Redirect,
	serde::{json::Json, Serialize},
};
use std::path::PathBuf;

#[rocket::get("/<path..>")]
pub async fn redirect(path: PathBuf) -> Redirect {
	let domain = std::env::var("DOMAIN").expect("Missing environment variable: DOMAIN");
	let new_uri = format!(
		"https://{}/{}",
		domain,
		path.into_os_string().into_string().unwrap()
	);
	Redirect::to(new_uri)
}

#[rocket::launch]
fn rocket() -> _ {
	dotenvy::dotenv().ok();
	rocket::build().mount("/", rocket::routes![redirect, version])
}

#[derive(Serialize)]
pub struct VersionInfo {
	version: String,
}

#[rocket::get("/version")]
pub fn version() -> Json<VersionInfo> {
	Json(VersionInfo {
		version: env!("CARGO_PKG_VERSION").to_string(),
	})
}
