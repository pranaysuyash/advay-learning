import pytest
from sqlalchemy import select

from app.db.models.progress import Progress


@pytest.mark.asyncio
async def test_progress_batch_integration(client, auth_headers, db_session):
    # Create profile
    profile_response = await client.post(
        "/api/v1/users/me/profiles",
        headers=auth_headers,
        json={"name": "Integration Child", "age": 7},
    )
    profile_id = profile_response.json()["id"]

    items = [
        {
            "idempotency_key": "int-1",
            "activity_type": "letter_tracing",
            "content_id": "X",
            "score": 60,
            "timestamp": "2026-01-29T00:00:00Z",
        },
        {
            "idempotency_key": "int-2",
            "activity_type": "letter_tracing",
            "content_id": "Y",
            "score": 70,
            "timestamp": "2026-01-29T00:00:05Z",
        },
    ]

    # First batch - should create two records
    resp1 = await client.post(
        "/api/v1/progress/batch",
        json={"profile_id": profile_id, "items": items},
        headers=auth_headers,
    )
    assert resp1.status_code == 200
    data1 = resp1.json()
    assert all(r["status"] == "ok" for r in data1["results"])

    # Assert DB state: two records present
    q = select(Progress).where(Progress.profile_id == profile_id)
    result = await db_session.execute(q)
    rows = result.scalars().all()
    assert len(rows) == 2

    # Repeat same batch - should be deduped
    resp2 = await client.post(
        "/api/v1/progress/batch",
        json={"profile_id": profile_id, "items": items},
        headers=auth_headers,
    )
    assert resp2.status_code == 200
    data2 = resp2.json()
    assert all(r["status"] == "duplicate" for r in data2["results"])

    # Mixed: one duplicate (int-1), one new (int-3)
    new_item = {
        "idempotency_key": "int-3",
        "activity_type": "letter_tracing",
        "content_id": "Z",
        "score": 85,
        "timestamp": "2026-01-29T00:00:10Z",
    }
    resp3 = await client.post(
        "/api/v1/progress/batch",
        json={"profile_id": profile_id, "items": [items[0], new_item]},
        headers=auth_headers,
    )
    assert resp3.status_code == 200
    data3 = resp3.json()
    assert data3["results"][0]["status"] == "duplicate"
    assert data3["results"][1]["status"] == "ok"

    # Final DB check: total should be 3
    result2 = await db_session.execute(q)
    rows2 = result2.scalars().all()
    assert len(rows2) == 3
