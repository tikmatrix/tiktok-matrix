use flexi_logger::{FileSpec, WriteMode};
pub fn init(work_dir: &str) {
    init_with_name(work_dir, None);
}
pub fn init_with_name(work_dir: &str, name: Option<&str>) {
    let spec = match name {
        Some(name) => FileSpec::default()
            .directory(format!("{}/logs", work_dir))
            .basename(name)
            .use_timestamp(false),
        None => FileSpec::default().directory(format!("{}/logs", work_dir)),
    };
    // initialize logger
    let _logger = flexi_logger::Logger::try_with_str("info")
        .unwrap()
        .log_to_file(spec)
        .duplicate_to_stderr(flexi_logger::Duplicate::Info)
        .write_mode(WriteMode::Direct)
        .o_append(true)
        .start()
        .expect("flexi_logger init error");
}
