"""API related functions and classes."""

import json
from typing import Any, Callable, Coroutine, Optional

from fastapi import FastAPI as OriginalFastAPI
from fastapi import HTTPException
from fastapi import Request as OriginalRequest
from fastapi import Response, applications
from fastapi.encoders import jsonable_encoder
from fastapi.openapi import docs
from fastapi.routing import APIRoute as OriginalAPIRoute
from fastapi.security import OpenIdConnect
from starlette.requests import Request as StarletteRequest
from starlette.responses import HTMLResponse

from app.db.core import Database
from app.http import HTTPClient
from app.state import State
from app.sync import OWSync
from app.utils.permissions import PermissionManager

__all__ = (
    "FastAPI",
    "Request",
    "APIRoute",
)


oidc = OpenIdConnect(
    openIdConnectUrl="https://old.online.ntnu.no/openid/.well-known/openid-configuration",
)


class FastAPI(OriginalFastAPI):
    db: Database
    http: HTTPClient
    app_state: State
    ow_sync: OWSync
    permission_manager: PermissionManager

    def set_db(self, db: Database) -> None:
        self.db = db

    def set_http(self, http: HTTPClient) -> None:
        self.http = http

    def set_app_state(self, state: State) -> None:
        self.app_state = state

    def set_ow_sync(self, ow_sync: OWSync) -> None:
        self.ow_sync = ow_sync

    def set_permission_manager(self, permission_manager: PermissionManager) -> None:
        self.permission_manager = permission_manager


class Request(OriginalRequest):
    @property
    def app(self) -> FastAPI:
        return super().app  # type: ignore

    @property
    def access_token(self) -> Optional[str]:
        token = self.headers.get("Authorization")
        if token is not None and token.lower().startswith("bearer "):
            return str(token[7:])
        return None

    def raise_if_missing_authorization(self) -> str:
        access_token = self.access_token
        if access_token is None:
            raise HTTPException(
                status_code=401,
                detail="Missing authorization",
            )

        return access_token


class APIRoute(OriginalAPIRoute):
    def get_route_handler(
        self,
    ) -> Callable[[StarletteRequest], Coroutine[Any, Any, Response]]:
        original_route_handler = super().get_route_handler()

        async def custom_route_handler(request: OriginalRequest) -> Response:
            request = Request(request.scope, request.receive)
            return await original_route_handler(request)

        return custom_route_handler


# Monkeypatch FastAPI docs to use our custom fetch function. All the overridden
# fetch function does is remove any "X-Requested-With" headers from requests.
# This is needed for the docs to work with the OIDC authentication because of CORS
# issues.
def patched_get_swagger_ui_html(
    *,
    openapi_url: str,
    title: str,
    swagger_js_url: str = "https://cdn.jsdelivr.net/npm/swagger-ui-dist@4/swagger-ui-bundle.js",
    swagger_css_url: str = "https://cdn.jsdelivr.net/npm/swagger-ui-dist@4/swagger-ui.css",
    swagger_favicon_url: str = "https://fastapi.tiangolo.com/img/favicon.png",
    oauth2_redirect_url: Optional[str] = None,
    init_oauth: Optional[dict[str, Any]] = None,
    swagger_ui_parameters: Optional[dict[str, Any]] = None,
) -> HTMLResponse:
    current_swagger_ui_parameters = docs.swagger_ui_default_parameters.copy()
    if swagger_ui_parameters:
        current_swagger_ui_parameters.update(swagger_ui_parameters)

    override_fetch = """
    const {fetch : originalFetch} = window;

    window.fetch = async (...args) => {
        const [url, options] = args;
        if (options && options.headers) {
            if (options.headers instanceof Headers) {
                console.log(options.headers)
                options.headers.delete('X-Requested-With');
            } else {
                delete options.headers['X-Requested-With'];
            }
        }

        const response = await originalFetch(...args);
        return response;
    };
    """

    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
    <link type="text/css" rel="stylesheet" href="{swagger_css_url}">
    <link rel="shortcut icon" href="{swagger_favicon_url}">
    <title>{title}</title>
    </head>
    <body>
    <div id="swagger-ui">
    </div>
    <script src="{swagger_js_url}"></script>
    <!-- `SwaggerUIBundle` is now available on the page -->
    <script>
    {override_fetch}

    const ui = SwaggerUIBundle({{
        url: '{openapi_url}',
    """

    for key, value in current_swagger_ui_parameters.items():
        html += f"{json.dumps(key)}: {json.dumps(jsonable_encoder(value))},\n"

    if oauth2_redirect_url:
        html += f"oauth2RedirectUrl: window.location.origin + '{oauth2_redirect_url}',"

    html += """
    presets: [
        SwaggerUIBundle.presets.apis,
        SwaggerUIBundle.SwaggerUIStandalonePreset
        ],
    })"""

    if init_oauth:
        html += f"""
        ui.initOAuth({json.dumps(jsonable_encoder(init_oauth))})
        """

    html += """
    </script>
    </body>
    </html>
    """
    return HTMLResponse(html)


docs.get_swagger_ui_html = patched_get_swagger_ui_html
applications.get_swagger_ui_html = patched_get_swagger_ui_html  # type: ignore
