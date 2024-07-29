use flexi_logger::{FileSpec, WriteMode};
pub fn init() {
    init_with_name(None);
}
pub fn init_with_name(name: Option<&str>) {
    let spec = match name {
        Some(name) => FileSpec::default()
            .directory("logs")
            .basename(name)
            .use_timestamp(false),
        None => FileSpec::default().directory("logs"),
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
