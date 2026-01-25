# Incident Translate Module

This module adds Google Translate functionality to the Incident content type forms in the Drupal admin interface.

## Features

- **Translate to All Languages**: One-click button to translate a field to all supported languages
- **Individual Language Translation**: Separate buttons for each supported language (Spanish, Chinese, Filipino, etc.)
- **Google Translate API Integration**: Uses Google's official translation API for high-quality translations
- **AJAX-Powered Interface**: Seamless user experience without page reloads
- **Admin Configuration**: Dedicated settings page for API key management
- **Error Handling**: Graceful fallbacks and user feedback for API issues

## Requirements

- Drupal 11.x
- Content Translation module enabled
- Incident Schema module
- Google Translate API key

## Installation

1. Enable the module:

   ```bash
   drush pm:enable incident_translate
   ```

2. Configure the Google Translate API key:
   - Go to `/admin/config/incident-translate`
   - Enter your Google Translate API key
   - Save the configuration

## Setup Google Translate API

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Translate API
4. Create credentials (API Key)
5. Copy the API key to the module configuration

## Usage

When editing an Incident node:

1. **Without API Key**: You'll see a warning message with a link to configure the API key
2. **With API Key**: Translate buttons appear below Title and Description fields
3. **Translate to All**: Click "Translate to All Languages" to translate to all supported languages
4. **Individual Languages**: Click specific language buttons for individual translations
5. **Feedback**: Buttons show progress and completion status

## Supported Fields

- **Title**: Main incident title field
- **Description**: Incident description field

## Technical Details

- Uses Google Translate API v2
- Translations are prepared for use in Drupal's content translation system
- AJAX-powered interface for seamless user experience
- Proper Drupal behaviors and once() API usage
- Responsive button layout with proper styling

## Important Notes

- **Cost**: Google Translate API is a paid service. Check the [pricing page](https://cloud.google.com/translate/pricing) for details.
- **Quality**: Machine translation quality may vary depending on the source and target languages.
- **Limitations**: The API has usage limits. Monitor your usage in Google Cloud Console.
- **Languages**: Automatically supports all languages enabled in your Drupal site.

## Troubleshooting

- **JavaScript Errors**: Ensure the module is properly enabled and cache is cleared
- **API Errors**: Check your API key is valid and has proper permissions
- **Buttons Not Showing**: Verify the API key is configured in module settings
- **Translation Failures**: Check network connectivity and API quota limits
