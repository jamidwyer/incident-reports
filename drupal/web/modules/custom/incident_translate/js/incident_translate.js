(function ($, Drupal, drupalSettings) {
  "use strict";

  Drupal.behaviors.incidentTranslate = {
    attach: function (context, settings) {
      $(".incident-translate-buttons", context).each(function () {
        var $container = $(this);
        var fieldName = $container.data("field");

        // Skip if already processed
        if ($container.hasClass("incident-translate-processed")) {
          return;
        }
        $container.addClass("incident-translate-processed");

        // Populate the current language field if we previously stored a translation.
        applyStoredTranslation(fieldName, $container);

        // Check if API key is configured
        if (!settings.incidentTranslate || !settings.incidentTranslate.apiKey) {
          $container.append(
            '<div class="incident-translate-warning">Google Translate API key not configured. Please configure it in the <a href="/admin/config/incident-translate" target="_blank">module settings</a>.</div>',
          );
          return;
        }

        // Create translate button
        var $translateButton = $(
          '<button type="button" class="button incident-translate-btn">',
        )
          .text("Translate to All Languages")
          .click(function (e) {
            e.preventDefault();
            translateField(fieldName, $container);
          });

        $container.append($translateButton);

        // Add individual language buttons
        if (
          settings.incidentTranslate &&
          settings.incidentTranslate.languages
        ) {
          var $languageButtons = $('<div class="incident-language-buttons">');
          $.each(
            settings.incidentTranslate.languages,
            function (langCode, langName) {
              var $langButton = $(
                '<button type="button" class="button button--small incident-lang-btn">',
              )
                .text(langName)
                .data("lang", langCode)
                .click(function (e) {
                  e.preventDefault();
                  translateFieldToLanguage(
                    fieldName,
                    $(this).data("lang"),
                    $container,
                  );
                });
              $languageButtons.append($langButton);
            },
          );
          $container.append($languageButtons);
        }
      });
    },
  };

  function translateField(fieldName, $container) {
    if (
      !drupalSettings.incidentTranslate ||
      !drupalSettings.incidentTranslate.languages
    ) {
      return;
    }

    var $field = getFieldElement(fieldName);
    if (!$field.length) {
      return;
    }

    var sourceText = $field.val();
    if (!sourceText) {
      alert("Please enter text to translate first.");
      return;
    }

    $container
      .find(".incident-translate-btn")
      .prop("disabled", true)
      .text("Translating...");

    // Get current language
    var currentLang = $("html").attr("lang") || "en";

    // Translate to all languages except current
    var promises = [];
    $.each(
      drupalSettings.incidentTranslate.languages,
      function (langCode, langName) {
        if (langCode !== currentLang) {
          promises.push(translateText(sourceText, currentLang, langCode));
        }
      },
    );

    Promise.all(promises)
      .then(function (results) {
        // Store translations for later use
        var translations = {};
        var index = 0;
        $.each(
          drupalSettings.incidentTranslate.languages,
          function (langCode, langName) {
            if (langCode !== currentLang) {
              translations[langCode] = results[index];
              index++;
            }
          },
        );

        // Store translations in localStorage for the form
        localStorage.setItem(
          "incident_translations_" + fieldName,
          JSON.stringify(translations),
        );

        // If translation fields exist on the page, populate them immediately.
        $.each(translations, function (langCode, translatedText) {
          setTranslationFieldValue(fieldName, langCode, translatedText);
        });

        $container
          .find(".incident-translate-btn")
          .prop("disabled", false)
          .text("Translated!");
        setTimeout(function () {
          $container
            .find(".incident-translate-btn")
            .text("Translate to All Languages");
        }, 2000);

        alert(
          "Translations completed! Switch to other languages to see the translated content.",
        );
      })
      .catch(function (error) {
        console.error("Translation error:", error);
        $container
          .find(".incident-translate-btn")
          .prop("disabled", false)
          .text("Translation Failed");
        alert("Translation failed. Please check your API key and try again.");
      });
  }

  function applyStoredTranslation(fieldName, $container) {
    var $field = getFieldElement(fieldName);
    if (!$field.length) {
      return;
    }

    var currentLang = $("html").attr("lang") || "en";
    var raw = localStorage.getItem("incident_translations_" + fieldName);
    if (!raw) {
      return;
    }

    var translations = {};
    try {
      translations = JSON.parse(raw);
    } catch (e) {
      return;
    }

    if (!translations[currentLang]) {
      return;
    }

    if ($field.val()) {
      return;
    }

    $field.val(translations[currentLang]);
  }

  function setTranslationFieldValue(fieldName, langCode, translatedText) {
    var $target = $(
      '[data-incident-translate-field="' +
        fieldName +
        '"][data-incident-translate-lang="' +
        langCode +
        '"]',
    );
    if (!$target.length) {
      var namePrefix =
        fieldName === "title"
          ? "incident_translation_title"
          : "incident_translation_description";
      $target = $('[name="' + namePrefix + '[' + langCode + ']"]');
    }
    if ($target.length) {
      $target.val(translatedText).trigger("change");
    }
  }

  function translateFieldToLanguage(fieldName, targetLang, $container) {
    var $field = getFieldElement(fieldName);
    if (!$field.length) {
      return;
    }

    var sourceText = $field.val();
    if (!sourceText) {
      alert("Please enter text to translate first.");
      return;
    }

    var $button = $container.find(
      '.incident-lang-btn[data-lang="' + targetLang + '"]',
    );
    $button.prop("disabled", true).text("Translating...");

    // Get current language
    var currentLang = $("html").attr("lang") || "en";

    translateText(sourceText, currentLang, targetLang)
      .then(function (translatedText) {
        // Store the translation
        var translations = JSON.parse(
          localStorage.getItem("incident_translations_" + fieldName) || "{}",
        );
        translations[targetLang] = translatedText;
        localStorage.setItem(
          "incident_translations_" + fieldName,
          JSON.stringify(translations),
        );

        $button.prop("disabled", false).text("Done");
        setTimeout(function () {
          $button.text(drupalSettings.incidentTranslate.languages[targetLang]);
        }, 2000);

        alert(
          "Translation to " +
            drupalSettings.incidentTranslate.languages[targetLang] +
            " completed!",
        );
      })
      .catch(function (error) {
        console.error("Translation error:", error);
        $button.prop("disabled", false).text("Failed");
        alert("Translation failed. Please check your API key and try again.");
      });
  }

  function translateText(text, sourceLang, targetLang) {
    return new Promise(function (resolve, reject) {
      if (!drupalSettings.incidentTranslate.apiKey) {
        reject(new Error("No API key configured"));
        return;
      }

      $.ajax({
        url: "https://translation.googleapis.com/language/translate/v2",
        method: "POST",
        data: {
          q: text,
          source: sourceLang,
          target: targetLang,
          key: drupalSettings.incidentTranslate.apiKey,
        },
        success: function (response) {
          if (
            response.data &&
            response.data.translations &&
            response.data.translations[0]
          ) {
            resolve(response.data.translations[0].translatedText);
          } else {
            reject(new Error("Invalid response from Google Translate API"));
          }
        },
        error: function (xhr, status, error) {
          var errorMessage = "API request failed";
          if (xhr.responseJSON && xhr.responseJSON.error) {
            errorMessage = xhr.responseJSON.error.message || errorMessage;
          }
          reject(new Error(errorMessage + ": " + error));
        },
      });
    });
  }

  function getFieldElement(fieldName) {
    switch (fieldName) {
      case "title":
        return $('input[name="title[0][value]"]');
      case "field_description":
        return $('textarea[name="field_description[0][value]"]');
      default:
        return $('[name*="' + fieldName + '"]');
    }
  }
})(jQuery, Drupal, drupalSettings);
