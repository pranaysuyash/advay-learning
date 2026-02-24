from httpx import AsyncClient


class TestIssueReports:
    """Test issue reporting API endpoints."""

    async def test_upload_clip_accepts_codec_qualified_webm_mime(
        self, client: AsyncClient, auth_headers: dict
    ):
        """Codec parameters should not cause 415 for valid WebM uploads."""
        create_response = await client.post(
            "/api/v1/issue-reports/sessions",
            headers=auth_headers,
            json={"game_id": "air-canvas", "issue_tags": ["video_quality"]},
        )
        assert create_response.status_code == 200
        report_id = create_response.json()["report_id"]

        upload_response = await client.post(
            f"/api/v1/issue-reports/{report_id}/clip",
            headers=auth_headers,
            data={"mime_type": "video/webm;codecs=vp9,opus"},
            files={"clip": ("clip.webm", b"fake-webm-bytes", "video/webm")},
        )
        assert upload_response.status_code == 200
        payload = upload_response.json()
        assert payload["status"] == "clip_uploaded"
        assert payload["mime_type"] == "video/webm"

    async def test_upload_clip_rejects_non_video_mime(
        self, client: AsyncClient, auth_headers: dict
    ):
        """Non-video MIME should still be rejected."""
        create_response = await client.post(
            "/api/v1/issue-reports/sessions",
            headers=auth_headers,
            json={"game_id": "air-canvas", "issue_tags": ["other"]},
        )
        assert create_response.status_code == 200
        report_id = create_response.json()["report_id"]

        upload_response = await client.post(
            f"/api/v1/issue-reports/{report_id}/clip",
            headers=auth_headers,
            data={"mime_type": "application/json;charset=utf-8"},
            files={"clip": ("clip.bin", b"{}", "application/json")},
        )
        assert upload_response.status_code == 415

