import os

def setup_logging():
    if not os.path.exists('logs'):
        os.mkdir('logs')

    return{
        'version': 1,
        'disable_existing_loggers': False,
        'formatters': {
            'default': {
                'format': '[%(asctime)s] %(levelname)s in %(module)s: %(message)s',
            },
            'detailed': {
                'format': '[%(asctime)s] %(levelname)s [%(name)s:%(lineno)d] %(message)s',
            }
        },
        'handlers': {
            'console': {
                'class': 'logging.StreamHandler',
                'stream': 'ext://flask.logging.wsgi_errors_stream',
                'formatter': 'default',
                'level': 'INFO'
            },
            'file': {
                'class': 'logging.handlers.RotatingFileHandler',
                'filename': 'logs/app.log',
                'maxBytes': 10000000, # 10MB
                'backupCount': 2,
                'formatter': 'detailed',
                'level': 'INFO'
            }
        },
        'root': {
            'level': 'INFO',
            'handlers': ['console', 'file']
        }
    }
