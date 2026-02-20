"""
Analysis Output Schema
======================
JSON schema and data structures for standardized analysis output
"""

ANALYSIS_SCHEMA = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "Toddler Game UI/UX Analysis",
    "type": "object",
    "properties": {
        "video_metadata": {
            "type": "object",
            "properties": {
                "file_path": {"type": "string"},
                "fps": {"type": "number"},
                "duration_seconds": {"type": "number"},
                "resolution": {
                    "type": "object",
                    "properties": {
                        "width": {"type": "integer"},
                        "height": {"type": "integer"}
                    }
                }
            },
            "required": ["file_path", "fps", "duration_seconds"]
        },
        "latency_analysis": {
            "type": "object",
            "properties": {
                "estimated_latency_ms": {"type": "number"},
                "measurement_method": {"type": "string"},
                "timestamp_ranges": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "start_ms": {"type": "number"},
                            "end_ms": {"type": "number"},
                            "latency_ms": {"type": "number"}
                        }
                    }
                }
            }
        },
        "jitter_analysis": {
            "type": "object",
            "properties": {
                "rating": {"type": "string", "enum": ["none", "low", "medium", "high"]},
                "mean_distance": {"type": "number"},
                "max_distance": {"type": "number"},
                "std_dev": {"type": "number"},
                "examples": {
                    "type": "array",
                    "items": {"type": "number"}  # timestamps
                }
            }
        },
        "target_sizes": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "width_pixels": {"type": "integer"},
                    "height_pixels": {"type": "integer"},
                    "size_percent_screen": {"type": "number"},
                    "meets_toddler_standard": {"type": "boolean"}
                }
            }
        },
        "pacing_analysis": {
            "type": "object",
            "properties": {
                "timer_duration_seconds": {"type": "number"},
                "fastest_transition_ms": {"type": "number"},
                "slowest_transition_ms": {"type": "number"},
                "assessment": {"type": "string"}
            }
        },
        "issues": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "id": {"type": "string"},
                    "severity": {"type": "string", "enum": ["S1", "S2", "S3"]},
                    "category": {"type": "string"},
                    "timestamps": {
                        "type": "array",
                        "items": {"type": "number"}
                    },
                    "evidence": {"type": "string"},
                    "impact": {"type": "string"},
                    "fix_recommendation": {"type": "string"}
                }
            }
        },
        "game_states": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "state": {"type": "string"},
                    "start_timestamp_ms": {"type": "number"},
                    "end_timestamp_ms": {"type": "number"},
                    "user_goal": {"type": "string"},
                    "system_signals": {"type": "string"},
                    "failure_modes": {"type": "string"}
                }
            }
        }
    }
}


# Example output following this schema
EXAMPLE_ANALYSIS_OUTPUT = {
    "video_metadata": {
        "file_path": "emoji_match_small.mp4",
        "fps": 30,
        "duration_seconds": 108,
        "resolution": {"width": 1920, "height": 1080}
    },
    "latency_analysis": {
        "estimated_latency_ms": 175,
        "measurement_method": "frame_comparison",
        "timestamp_ranges": [
            {"start_ms": 1000, "end_ms": 10000, "latency_ms": 150},
            {"start_ms": 20000, "end_ms": 30000, "latency_ms": 200}
        ]
    },
    "jitter_analysis": {
        "rating": "medium",
        "mean_distance": 1.2,
        "max_distance": 8.5,
        "std_dev": 2.1,
        "examples": [8000, 76000]
    },
    "target_sizes": [
        {
            "name": "emoji_circle",
            "width_pixels": 120,
            "height_pixels": 120,
            "size_percent_screen": 0.58,
            "meets_toddler_standard": False
        }
    ],
    "pacing_analysis": {
        "timer_duration_seconds": 10,
        "fastest_transition_ms": 500,
        "slowest_transition_ms": 1500,
        "assessment": "Too fast for toddler motor control"
    },
    "issues": [
        {
            "id": "ISSUE-001",
            "severity": "S2",
            "category": "Performance/Tracking",
            "timestamps": [0, 60000],
            "evidence": "Consistent delay between hand movement and cursor response",
            "impact": "Frustration for toddlers with poor temporal coordination",
            "fix_recommendation": "Optimize tracking pipeline for <100ms latency"
        },
        {
            "id": "ISSUE-002",
            "severity": "S1",
            "category": "UI/Child-friendly",
            "timestamps": [0, 108000],
            "evidence": "Cyan cursor ring approximately 2% of screen width",
            "impact": "Toddlers cannot easily track or understand cursor as their hand",
            "fix_recommendation": "Enlarge cursor to 5% screen width, add solid fill"
        }
    ],
    "game_states": [
        {
            "state": "intro",
            "start_timestamp_ms": 0,
            "end_timestamp_ms": 1000,
            "user_goal": "Understand game objective",
            "system_signals": "Title, instruction text, start button",
            "failure_modes": "Cannot read instructions"
        },
        {
            "state": "active_play",
            "start_timestamp_ms": 1000,
            "end_timestamp_ms": 100000,
            "user_goal": "Find and pinch correct emoji",
            "system_signals": "Prompt, timer, emoji options",
            "failure_modes": "Pinch not registering, timer expires"
        }
    ]
}
