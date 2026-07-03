import logging

from app.config.settings import settings


def setup_logger() -> logging.Logger:
    """
    Configure application-wide logging.
    """

    logging.basicConfig(
        level=settings.log_level,
        format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    )

    logger = logging.getLogger(settings.app_name)
    return logger


logger = setup_logger()