(function ($, Drupal) {
  'use strict';

  Drupal.behaviors.nameToggle = {
    attach: function (context, settings) {
      var $checkbox = $('#edit-field-name-known-value', context);
      var $givenName = $('#edit-field-given-name-0-value', context);
      var $familyName = $('#edit-field-family-name-0-value', context);

      function toggleNames() {
        if ($checkbox.is(':checked')) {
          $givenName.closest('.form-item').show();
          $familyName.closest('.form-item').show();
        } else {
          $givenName.closest('.form-item').hide();
          $familyName.closest('.form-item').hide();
        }
      }

      // Initial toggle.
      toggleNames();

      // On change.
      $checkbox.on('change', toggleNames);
    }
  };

})(jQuery, Drupal);