use rand::Rng;
use rocket::response::Redirect;
use rocket::State;
use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::Mutex;
use std::time::{SystemTime, UNIX_EPOCH};

const PIN_LENGTH: usize = 6;
const EXPIRATION_TIME: u64 = 60 * 10;

pub type Clipboard = Mutex<HashMap<u32, ClipboardEntry>>;

pub struct ClipboardEntry {
	timestamp: u64,
	data: String,
}

#[rocket::post("/clipboard", data = "<input>")]
pub fn endpoint(input: &str, state: &State<Clipboard>) -> String {
	let mut state = state.lock().expect("lock failed");

	let now = SystemTime::now()
		.duration_since(UNIX_EPOCH)
		.unwrap()
		.as_secs();

	state.retain(|_, v| v.timestamp + EXPIRATION_TIME > now);

	if input.is_empty() {
		return String::new();
	}

	if let Some(input_pin) = pin_from_str(input) {
		if let Some(entry) = state.remove(&input_pin) {
			return entry.data;
		} else {
			return "Invalid/expired".to_string();
		}
	}

	let new_pin = rand::thread_rng().gen_range(0..10u32.pow(PIN_LENGTH as u32));

	state.insert(
		new_pin,
		ClipboardEntry {
			timestamp: now,
			data: input.to_owned(),
		},
	);

	format!("{:0>1$}", new_pin, PIN_LENGTH)
}

fn pin_from_str(s: &str) -> Option<u32> {
	if s.len() == PIN_LENGTH && s.chars().all(|c| c.is_ascii_digit()) {
		if let Ok(n) = s.parse::<u32>() {
			return Some(n);
		}
	}

	None
}

#[get("/c")]
pub fn alias() -> Redirect {
	Redirect::to(uri!(crate::static_pages("/clipboard")))
}

#[get("/c/<pin>")]
pub fn pin_url(pin: &str, state: &State<Clipboard>) -> String {
	endpoint(pin, state)
}
