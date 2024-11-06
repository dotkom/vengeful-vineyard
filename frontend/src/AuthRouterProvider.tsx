import { createRoutesFromElements, Route, RouterProvider, Navigate, createBrowserRouter } from "react-router-dom"
import { Layout } from "./views/layout"
import { Profile } from "./pages/profile"
import { WallOfShame } from "./pages/wallOfShame"
import { Committees } from "./pages/committees"
import { useAuth } from "react-oidc-context"
import { LandingPage } from "./views/hero"
import { GroupView } from "./views/groups"
import LoginRegisterPromptPage from "./views/LoginRegisterPromptPage"

const authenticatedRouter = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route path="/" element={<GroupView />} />
      <Route path="/gruppe/:groupName/" element={<GroupView />} />
      <Route path="/profil" element={<Profile />} />
      <Route path="/wall-of-shame" element={<WallOfShame />} />
      <Route path="/committees" element={<Committees />} />
    </Route>
  )
)

const unauthenticatedRouter = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route path="/" element={<LandingPage />} />
      <Route path="/gruppe/:groupName/" element={<LoginRegisterPromptPage />} />
      <Route path="/profil" element={<Navigate to="/" />} />
      <Route path="/wall-of-shame" element={<Navigate to="/" />} />
      <Route path="/committees" element={<Navigate to="/" />} />
    </Route>
  )
)

export default function AuthRouterProvider() {
  const auth = useAuth()

  const json1 = JSON.stringify({
    id_token:
      "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImlBaVc4a0JmUmE4U1NfV3BTcUJLWSJ9.eyJnaXZlbl9uYW1lIjoiZmlyc3ROYW1lIiwiZmFtaWx5X25hbWUiOiJsYXN0TmFtZSIsIm5pY2tuYW1lIjoic29uZHJhbGYiLCJuYW1lIjoiZmlyc3ROYW1lIG1pZGRsZU5hbWUgbGFzdE5hbWUiLCJwaWN0dXJlIjoiaHR0cHM6Ly9leGFtcGxlLmNvbS9pbWFnZS5qcGciLCJ1cGRhdGVkX2F0IjoiMjAyNC0xMS0wNlQxNjo0NzoyNy4zMzlaIiwiZW1haWwiOiJzb25kcmFsZkBzdHVkLm50bnUubm8iLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImlzcyI6Imh0dHBzOi8vYXV0aC5kZXYub25saW5lLm50bnUubm8vIiwiYXVkIjoiZ3MxYjZDeHNsVmkzSEZST1RZeGRzMjRsZHhzN3pmM0MiLCJpYXQiOjE3MzA5MTI5MzMsImV4cCI6MTczMDk0ODkzMywic3ViIjoiYXV0aDB8NjVkZjg4NGZmZjdhZWQyNGMwZjEzM2M5Iiwic2lkIjoiOU4zSzEyU3ZPYUhlY0RPczFNa2tFeEEwSjlSZ3dNUE0ifQ.Awoe5ItodzJgOUzvHTQCtm7JIKl2zkK2h3kxwDJEWcN50WtdBEoUkkc_SvL7-Hcai-iB17B4qTcCdCe6EOCUq-sSM_prGLce2054wvwxFbaUuudQeqmo6OWdDZ_jSIymz3r1ktLypXa5CyIcz3q1oPgR1nWNa6cCT_WyFRhw3oFh_1B9qQhdJ4iSaNt5WXRarYqJBOqGGHInxngLFj_skgptKCXSRlVkcCMuul8RuPaH0ntsW4VpW-atYCa8QbgZLUL0oG0uLajUIMmkHNU6niXG-qHahJPx8b3VoYbLBsx7M0roBod0qZg4MaVlvZSVrFbGAMuN7IjV-59jXos68A",
    session_state: null,
    access_token:
      "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImlBaVc4a0JmUmE4U1NfV3BTcUJLWSJ9.eyJpc3MiOiJodHRwczovL2F1dGguZGV2Lm9ubGluZS5udG51Lm5vLyIsInN1YiI6ImF1dGgwfDY1ZGY4ODRmZmY3YWVkMjRjMGYxMzNjOSIsImF1ZCI6WyJodHRwczovL29ubGluZS5udG51Lm5vIiwiaHR0cHM6Ly9vbmxpbmV3ZWIuZXUuYXV0aDAuY29tL3VzZXJpbmZvIl0sImlhdCI6MTczMDkxMjkzMywiZXhwIjoxNzMwOTk5MzMzLCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIGVtYWlsIG9mZmxpbmVfYWNjZXNzIiwiYXpwIjoiZ3MxYjZDeHNsVmkzSEZST1RZeGRzMjRsZHhzN3pmM0MiLCJwZXJtaXNzaW9ucyI6W119.J_YMTQXznCQN1yh9D7SNGfGp7EKIE34GC6TeBZdzdsjl0iXyhbaKMOe0oOKAcb-Msup1wjanFQfMfU4xdyjdF1xqBTru3fMGJwPFvzIoiMVboVytp2RRqMsmtmMMcDKf8GQp0Q2j5x11rnZ4fwKIErElmZ4vafvGSTtw3286pe9TwP3X7M_pRvVALlxayre5uL_WGib7Em75xX-7WQjHD3eAMFHWbf7pQdsdwxuDuRRWGG9hI3wqGqY_QwziDNs4qESd-wgZoSpXqbtrMEN93PzO6OAR2DjpZTroiGD-p7Fc7Aqm-oTr3uCy1fnscBLMRdH5AQK87pn_N-XxW7FrbQ",
    refresh_token: "v1.MZ_NzX78YssUiENgz0OXt9_uYe6NOUtg2iO22JpAMikeMetWWcG0zJnPfMKToDYrdn300fwfi-J1Lc6lypGXYHQ",
    token_type: "Bearer",
    scope: "openid profile email offline_access",
    profile: {
      given_name: "firstName",
      family_name: "lastName",
      nickname: "sondralf",
      name: "firstName middleName lastName",
      picture: "https://example.com/image.jpg",
      updated_at: "2024-11-06T16:47:27.339Z",
      email: "sondralf@stud.ntnu.no",
      email_verified: false,
      iss: "https://auth.dev.online.ntnu.no/",
      aud: "gs1b6CxslVi3HFROTYxds24ldxs7zf3C",
      iat: 1730912933,
      exp: 1730948933,
      sub: "auth0|65df884fff7aed24c0f133c9",
      sid: "9N3K12SvOaHecDOs1MkkExA0J9RgwMPM",
    },
    expires_at: 1730999333,
  })

  const json2 = JSON.stringify({
    id_token:
      "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InZFZXNMd2dXaGd3bUdwTnZ3akgxMyJ9.eyJnaXZlbl9uYW1lIjoiU29uZHJlIiwiZmFtaWx5X25hbWUiOiJBbGZuZXMiLCJuaWNrbmFtZSI6InNvbmRyYWxmIiwibmFtZSI6InNvbmRyYWxmQHN0dWQubnRudS5ubyIsInBpY3R1cmUiOiJodHRwczovL3NlY3VyZS5ncmF2YXRhci5jb20vYXZhdGFyL2UyYTU3MjJlZDIxODRlNzllMWQyZGE5OGIwMjVjODc2P3M9NDgwJnI9cGcmZD1odHRwcyUzQSUyRiUyRmNkbi5hdXRoMC5jb20lMkZhdmF0YXJzJTJGc28ucG5nIiwidXBkYXRlZF9hdCI6IjIwMjQtMTAtMjNUMTU6MTI6NDcuMTAxWiIsImVtYWlsIjoic29uZHJhbGZAc3R1ZC5udG51Lm5vIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImlzcyI6Imh0dHBzOi8vYXV0aC5vbmxpbmUubnRudS5uby8iLCJhdWQiOiJhMkpXcVdmVm5ZaXp5RjMxaEFrSXl6NmFJQ2pSa3dqUSIsImlhdCI6MTcyOTY5ODQ5MSwiZXhwIjoxNzI5NzM0NDkxLCJzdWIiOiJhdXRoMHxhYzE2ZmZjOC1iNWQ5LTQ0YzAtYTkzMy00ZjgyMzAzMzNkNTgiLCJzaWQiOiJqQ2ppbzVQaC1FRTRERnNGRnZSQ3BUTkdSMGZNMDBySSJ9.jXNQiOqUl2l60suHrEMH3YBuc5bc1EnzViHGEOr98V1FyEjP4ZARPXfUlvrtEn69LT8r4HK-e5L9GB7tK5KI-rpdo-beT0NoiDfTOZbO4vJrUbKspsHqFiGwQIeUkvbKc8hKl4IIAQaE8LDGVpNrRI2riq5NlnwKxSsk18ebS8o6a_vltDniBp3dMf66JA1mjEvf-pAYpq2OpbVcs4C1KFJ34n43oa49LS-WNS1lsJOfqmYahRy5K5sNK3vqF2z63eOkk1yov_aZbxfz69sM-1uBgqZC4sVaHFxAfc7gnqQb9b9W4rlGyQ2-xo0un2ffjcpTD65WmHQme1xybaPhGA",
    session_state: null,
    access_token:
      "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InZFZXNMd2dXaGd3bUdwTnZ3akgxMyJ9.eyJpc3MiOiJodHRwczovL2F1dGgub25saW5lLm50bnUubm8vIiwic3ViIjoiYXV0aDB8YWMxNmZmYzgtYjVkOS00NGMwLWE5MzMtNGY4MjMwMzMzZDU4IiwiYXVkIjpbImh0dHBzOi8vb25saW5lLm50bnUubm8iLCJodHRwczovL29ubGluZXdlYi1wcm9kLmV1LmF1dGgwLmNvbS91c2VyaW5mbyJdLCJpYXQiOjE3Mjk2OTg0OTEsImV4cCI6MTcyOTc4NDg5MSwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSBlbWFpbCBvZmZsaW5lX2FjY2VzcyIsImF6cCI6ImEySldxV2ZWbllpenlGMzFoQWtJeXo2YUlDalJrd2pRIiwicGVybWlzc2lvbnMiOltdfQ.m9bLli0t9RSxK48zKLpG_3hL9fK3DXfMQ1oRjIM8v-O6lsGe0TvYdZQ9fadel-2V7XiPv0bEL1k5bEfw5dtKmKzHgS38r8ksRNPcWEfKHNQeQwigBxjk7S7A9x4l6HDxPy1q_tc7QBwrEWUos9ZezJHwibuC8BwtFwsNawQOM8DV_E3kWtpIPAtB0Cu7bGHvFjfeTX97GkuVu98EOtL5MAInhY1qQ5jw7xlD2KVw_IMdb5he6Lwn5xz3Y3gD9FaOjSyitpUrJ4DsZsRyhzJr13m1RQxq3wtjtQHZgc_m3Oj-auePN5vdnnnl2dPImxiPjH1FZYZfV3gwzr5f3x6QRQ",
    refresh_token: "v1.MfIGOc9QZJx60ECimZc6STHfPtyxyWMm_WAHr5366W2hYFcUoJYgqohJV6TzL4sNPxGQY3G1mYzVWKwm7Qjzt4Y",
    token_type: "Bearer",
    scope: "openid profile email offline_access",
    profile: {
      given_name: "Sondre",
      family_name: "Alfnes",
      nickname: "sondralf",
      name: "sondralf@stud.ntnu.no",
      picture:
        "https://secure.gravatar.com/avatar/e2a5722ed2184e79e1d2da98b025c876?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fso.png",
      updated_at: "2024-10-23T15:12:47.101Z",
      email: "sondralf@stud.ntnu.no",
      email_verified: true,
      iss: "https://auth.online.ntnu.no/",
      aud: "a2JWqWfVnYizyF31hAkIyz6aICjRkwjQ",
      iat: 1729698491,
      exp: 1729734491,
      sub: "auth0|ac16ffc8-b5d9-44c0-a933-4f8230333d58",
      sid: "jCjio5Ph-EE4DFsFFvRCpTNGR0fM00rI",
    },
    expires_at: 1729784891,
  })

  localStorage.setItem("oidc.user:https://auth.dev.online.ntnu.no:gs1b6CxslVi3HFROTYxds24ldxs7zf3C", json1)
  localStorage.setItem("oidc.user:oidc.user:https://auth.online.ntnu.no:a2JWqWfVnYizyF31hAkIyz6aICjRkwjQ", json2)

  return <RouterProvider router={auth.isAuthenticated ? authenticatedRouter : unauthenticatedRouter} />
}
