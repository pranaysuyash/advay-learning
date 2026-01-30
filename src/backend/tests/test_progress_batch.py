import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_progress_batch_endpoint(client: AsyncClient, auth_headers):
    # Create a profile to attach progress to
    profile_response = await client.post(
        "/api/v1/users/me/profiles",
        headers=auth_headers,
        json={"name": "Batch Child", "age": 6}
    )
    profile_id = profile_response.json()["id"]

    items = [
        {
            "idempotency_key": "k-a-1",
            "activity_type": "letter_tracing",
            "content_id": "A",
            "score": 80,
            "timestamp": "2026-01-29T00:00:00Z"
        },
        {
            "idempotency_key": "k-a-2",
            "activity_type": "letter_tracing",
            "content_id": "B",
            "score": 70,
            "timestamp": "2026-01-29T00:00:05Z"
        }
    ]

    response = await client.post("/api/v1/progress/batch", json={"profile_id": profile_id, "items": items}, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "results" in data
    assert len(data["results"]) == 2

    # Repeat same batch - should be deduped and return duplicate statuses
    response2 = await client.post("/api/v1/progress/batch", json={"profile_id": profile_id, "items": items}, headers=auth_headers)
    assert response2.status_code == 200
    data2 = response2.json()
    assert "results" in data2
    assert len(data2["results"]) == 2
    assert all(r.get('status') == 'duplicate' for r in data2['results'])

    # Mixed case: one new, one duplicate
    new_item = {
        "idempotency_key": "k-a-3",
        "activity_type": "letter_tracing",
        "content_id": "C",
        "score": 85,
        "timestamp": "2026-01-29T00:00:10Z"
    }
    response3 = await client.post("/api/v1/progress/batch", json={"profile_id": profile_id, "items": [items[0], new_item]}, headers=auth_headers)
    assert response3.status_code == 200
    data3 = response3.json()
    assert len(data3['results']) == 2
    assert data3['results'][0]['status'] == 'duplicate'
    assert data3['results'][1]['status'] == 'ok'
