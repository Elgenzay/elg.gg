use rocket::response::Redirect;
use std::path::PathBuf;

#[rocket::get("/<path..>")]
pub async fn redirect(path: PathBuf) -> Redirect {
	let mut new_uri = String::from("https://");
	let domain = std::env::var("DOMAIN").expect("Missing environment variable: DOMAIN");
	new_uri.push_str(&domain);
	new_uri.push_str(&path.into_os_string().into_string().unwrap());
	Redirect::to(new_uri)
}

#[rocket::launch]
fn rocket() -> _ {
	dotenvy::dotenv().ok();
	rocket::build().mount("/", rocket::routes![redirect])
}
