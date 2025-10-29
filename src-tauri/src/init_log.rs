use std::{env, path};

use flexi_logger::{Cleanup, Criterion, DeferredNow, FileSpec, Naming, WriteMode};
use log::Record;
pub fn init(work_dir: &str) {
    init_with_name(work_dir, None);
}
pub fn init_with_name(work_dir: &str, name: Option<&str>) {
    let level = env::var("LOG_LEVEL").unwrap_or("info".to_string());
    log::info!("log level: {}", level);
    let spec = match name {
        Some(name) => FileSpec::default()
            .directory(format!("{}/logs", work_dir))
            .basename(name)
            .use_timestamp(false),
        _ => FileSpec::default().directory(format!("{}/logs", work_dir)),
    };
    // initialize logger
    // allow configuring rotation via env vars:
    // LOG_ROTATE_MAX_MB - max size in MB before rotate (default 5 MB)
    // LOG_ROTATE_KEEP_FILES - how many rotated files to keep (default 3)
    let max_mb: u64 = env::var("LOG_ROTATE_MAX_MB")
        .ok()
        .and_then(|s| s.parse().ok())
        .unwrap_or(5);
    let keep_files: usize = env::var("LOG_ROTATE_KEEP_FILES")
        .ok()
        .and_then(|s| s.parse().ok())
        .unwrap_or(3usize);
    let max_bytes = max_mb.saturating_mul(1024 * 1024);

    let _logger = flexi_logger::Logger::try_with_str(&level)
        .unwrap()
        .log_to_file(spec)
        // rotate by size, name rotated files by timestamp, and keep limited files
        .rotate(
            Criterion::Size(max_bytes),
            Naming::Timestamps,
            Cleanup::KeepLogFiles(keep_files),
        )
        .duplicate_to_stderr(flexi_logger::Duplicate::All)
        .write_mode(WriteMode::Direct)
        .o_append(true)
        .format(my_format)
        .start()
        .expect("flexi_logger init error");
}
pub const TS_DASHES_BLANK_COLONS_DOT_BLANK: &str = "%m-%d %H:%M:%S%.6f";
pub fn my_format(
    w: &mut dyn std::io::Write,
    now: &mut DeferredNow,
    record: &Record,
) -> Result<(), std::io::Error> {
    write!(
        w,
        "[{}] {} [{}:{}] {}",
        now.format(TS_DASHES_BLANK_COLONS_DOT_BLANK),
        record.level(),
        record
            .file()
            .unwrap_or("<unnamed>")
            .split(path::is_separator)
            .last()
            .unwrap_or(""),
        record.line().unwrap_or(0),
        &record.args()
    )
}
