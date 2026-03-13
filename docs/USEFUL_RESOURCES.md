# Useful Resources

## Public APIs for Kids Games

### Astronomy & Space APIs
| API | Description | Key | CORS | Games |
|-----|-------------|-----|------|-------|
| [NASA APOD](https://api.nasa.gov/) | Astronomy Picture of the Day | No key (DEMO) | Yes | NASA Sky Hunt |
| [NASA NeoWs](https://api.nasa.gov/) | Near Earth Objects | No key | Yes | NASA Sky Hunt |
| [Open-Meteo](https://open-meteo.com/) | Weather Forecast | No key | Yes | Weather Lab |

### Animal & Nature APIs
| API | Description | Key | CORS | Games |
|-----|-------------|-----|------|-------|
| [Cat Facts](https://alexwohlbruck.github.io/cat-facts/) | Random cat facts | No | Yes | Animal Sounds |
| [Dog Facts](https://dukengn.github.io/Dog-facts-API/) | Random dog facts | No | Yes | Animal Sounds |
| [The Cat API](https://thecatapi.com/) | Cat pictures | API key | Yes | Bubble Biology |

### Weather APIs
| API | Description | Key | CORS | Games |
|-----|-------------|-----|------|-------|
| [Open-Meteo](https://open-meteo.com/) | Weather Forecast | No | Yes | Weather Lab |
| [Weatherstack](https://weatherstack.com/) | Weather data | API key | Yes | Weather Lab |

### Art & Design APIs
| API | Description | Key | CORS | Games |
|-----|-------------|-----|------|-------|
| [EmojiHub](https://github.com/cheatsnake/emojihub) | Emoji by category | No | Yes | All games |
| [Icons8](https://img.icons8.com/) | Icons | No | Yes | UI components |

### Books & Literature APIs
| API | Description | Key | CORS | Games |
|-----|-------------|-----|------|-------|
| [PoetryDB](https://github.com/thundercomb/poetrydb) | Poetry collection | No | Yes | Stories |
| [Bible API](https://bible-api.com/) | Bible verses | No | Yes | Stories |

### Development & Testing APIs
| API | Description | Key | CORS | Games |
|-----|-------------|-----|------|-------|
| [Bored API](https://www.boredapi.com/) | Random activities | No | Yes | Activity games |
| [Httpbin](https://httpbin.org/) | HTTP testing | No | Yes | Testing |
| [Postman Echo](https://www.postman-echo.com) | API testing | No | Yes | Testing |

### Free Image APIs
| API | Description | Key | CORS | Games |
|-----|-------------|-----|------|-------|
| [Unsplash](https://unsplash.com/developers) | Free photos | API key | Yes | Backgrounds |
| [Picsum](https://picsum.photos/) | Placeholder images | No | Yes | UI components |
| [Lorem Picsum](https://picsum.photos/) | Random images | No | Yes | Testing |

## Public APIs Repository

**URL**: https://github.com/public-apis/public-apis

**Description**: A collective list of free APIs for use in software and web development.

**Relevant Sections for Kids Games**:
- Animals: Cat/Dog facts, pictures
- Anime: Anime quotes, facts
- Books: Poetry, stories
- Entertainment: GIFs, images
- Games & Comics: Game data
- Science & Math: Space, astronomy
- Weather: Real weather data

## Usage Examples

### NASA APOD (No API Key Required)
```javascript
fetch('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY')
  .then(res => res.json())
  .then(data => console.log(data));
```

### Open-Meteo Weather (No API Key)
```javascript
fetch('https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current_weather=true')
  .then(res => res.json())
  .then(data => console.log(data.current_weather));
```

### Cat Facts (No API Key)
```javascript
fetch('https://catfact.ninja/fact')
  .then(res => res.json())
  .then(data => console.log(data.fact));
```

## Best Practices for Kids Apps

1. **No API Keys for Kids**: Prefer APIs that don't require keys to avoid exposing secrets
2. **Rate Limits**: Be mindful of free tier limits (NASA: 30 requests/hour)
3. **CORS**: Ensure APIs support CORS for browser use
4. **Educational Content**: Use APIs with kid-friendly, educational data
5. **Offline Fallback**: Always have local data as backup when APIs fail

## Integration Guide

### Weather Lab Enhancement
Use Open-Meteo API for real weather data:
```javascript
// Get current weather for a city
async function getRealWeather(lat, lon) {
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
  );
  const data = await response.json();
  return data.current_weather;
}
```

### NASA Sky Hunt Enhancement
Use NASA APIs for real space content:
```javascript
// Get Astronomy Picture of the Day
async function getAPOD() {
  const response = await fetch(
    'https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY'
  );
  const data = await response.json();
  return data;
}
```

### Animal Sounds Enhancement
Use animal facts API:
```javascript
// Get random cat fact
async function getCatFact() {
  const response = await fetch('https://catfact.ninja/fact');
  const data = await response.json();
  return data.fact;
}
```

## Saved Resources

### API List JSON
The full public APIs list is available at:
https://raw.githubusercontent.com/public-apis/public-apis/master/README.md

### Key APIs for Kids Apps

**No API Key Required**:
- Open-Meteo (Weather)
- NASA APOD (Space images)
- Cat/Dog Facts
- Bored API (Activities)
- Httpbin (Testing)

**API Key Required (Free Tier)**:
- Unsplash (Photos)
- The Cat API (Cat pictures)
- Weatherstack (Weather)

## Notes

- All NASA APIs work with DEMO_KEY (limited rate)
- Open-Meteo is completely free with no key required
- Cat/Dog facts APIs are 100% free
- Always have offline fallbacks for production apps
