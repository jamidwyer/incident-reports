# Incident Reports

A Drupal-based web application for reporting and managing incidents of state violence.

This project provides a structured way to document incidents with details about the location, time, involved persons, and supporting media.

This tool is intended to document state violence and may not be used to oppress the working class.

## Features

- **Incident Reporting**: Create detailed reports of incidents with required fields for time and place, and optional descriptions, reporters, involved persons, and photos.
- **Person Management**: Maintain profiles for individuals involved in incidents, including physical descriptions and associated media.
- **Location Tracking**: Associate incidents with specific places, including postal addresses and geographic coordinates.
- **Modular Architecture**: Built with custom Drupal modules for extensibility.

## Drupal Docs

Drupal-specific setup, configuration, content types, and deployment details live in `drupal/README.md`.

### React Frontend (Incidents List)

A lightweight React frontend is available via Docker and consumes the Drupal REST endpoint at `/api/incidents`.

Start it with Docker Compose (it runs alongside Drupal):

```bash
docker compose up -d --build
```

Then open: http://localhost:5173

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

## License

See `drupal/LICENSE.txt` for licensing information.

- add 10 incidents
- translate all to spanish
- somalian
- hmong (vietnamese?)
- haitian?
- add vehicle content type
- add videos to incident
- outfit needs to be better
- add sources to incident
- make it so folks can add all needed fields on the incident page
- figure out crowdsourcing...
- add view of Incidents to each content view, eg ICE has all its incidents in a list
- sorting
- add incident type enum (murder, homicide, assault, kidnapping, arrest, neglect, medical malpractice), default sort by this
- add victims as Person when you're _sure_ the website won't mix perps and victims
- add optional Operator field to Place. can be Person or Organization?
- add chain of command for both person and organization
- remove powered by drupal not tryna get buytaert on a watchlist
- add Investigation field
- exportable as CSV
- timezones
- add salary to Person
- google translate key to .env
- Theme
- login bar
- make all possible fields optional
- security
- decentralization
- disappeared data
- json_schema_validation,api_documentation
- drupal not in php container
- disable copilot code review wtf
- jQuery in admin to plain JS
