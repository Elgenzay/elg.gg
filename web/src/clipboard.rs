use rocket::response::Redirect;
use rocket::State;
use std::path::PathBuf;
use std::sync::Mutex;

pub type LastInput = Mutex<String>;

#[rocket::post("/clipboard", data = "<input>")]
pub fn endpoint(input: String, last_input: &State<LastInput>) -> String {
	let mut last_input = last_input.lock().expect("lock failed");
	std::mem::replace(&mut *last_input, input)
}

#[get("/c")]
pub fn alias() -> Redirect {
	Redirect::to(uri!(crate::static_pages("/clipboard")))
}
