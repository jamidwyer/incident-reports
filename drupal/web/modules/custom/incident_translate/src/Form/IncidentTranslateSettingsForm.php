<?php

namespace Drupal\incident_translate\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Configure Incident Translate settings.
 */
class IncidentTranslateSettingsForm extends ConfigFormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'incident_translate_settings';
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return ['incident_translate.settings'];
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $config = $this->config('incident_translate.settings');

    $form['google_translate_api_key'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Google Translate API Key'),
      '#description' => $this->t('Enter your Google Translate API key. You can get one from the <a href="https://console.developers.google.com/" target="_blank">Google Cloud Console</a>.'),
      '#default_value' => $config->get('google_translate_api_key'),
      '#required' => TRUE,
    ];

    $form['help'] = [
      '#type' => 'markup',
      '#markup' => $this->t('<p><strong>Setup Instructions:</strong></p>
        <ol>
          <li>Go to the <a href="https://console.cloud.google.com/" target="_blank">Google Cloud Console</a></li>
          <li>Create a new project or select an existing one</li>
          <li>Enable the Google Translate API</li>
          <li>Create credentials (API Key)</li>
          <li>Copy the API key and paste it above</li>
        </ol>
        <p><strong>Note:</strong> The Google Translate API is a paid service. Check the <a href="https://cloud.google.com/translate/pricing" target="_blank">pricing page</a> for details.</p>'),
    ];

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $this->config('incident_translate.settings')
      ->set('google_translate_api_key', $form_state->getValue('google_translate_api_key'))
      ->save();

    parent::submitForm($form, $form_state);
  }

}