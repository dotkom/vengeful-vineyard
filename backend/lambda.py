from mangum import Mangum

from app.api.init_api import asgi_app

handler = Mangum(asgi_app, lifespan="auto", api_gateway_base_path="/api")
