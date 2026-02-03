<?php

namespace Drupal\incident_schema\Plugin\rest\resource;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\File\FileUrlGeneratorInterface;
use Drupal\file\FileInterface;
use Drupal\node\NodeInterface;
use Drupal\rest\Plugin\ResourceBase;
use Drupal\rest\ResourceResponse;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\Request;
use Psr\Log\LoggerInterface;

/**
 * Provides a custom REST resource for incidents.
 *
 * @RestResource(
 *   id = "incidents_resource",
 *   label = @Translation("Incidents REST Resource"),
 *   uri_paths = {
 *     "canonical" = "/api/incidents"
 *   }
 * )
 */
class IncidentsResource extends ResourceBase {
  protected EntityTypeManagerInterface $entityTypeManager;
  protected FileUrlGeneratorInterface $fileUrlGenerator;

  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    array $serializer_formats,
    LoggerInterface $logger,
    EntityTypeManagerInterface $entityTypeManager,
    FileUrlGeneratorInterface $fileUrlGenerator
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition, $serializer_formats, $logger);
    $this->entityTypeManager = $entityTypeManager;
    $this->fileUrlGenerator = $fileUrlGenerator;
  }

  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition): self {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->getParameter('serializer.formats'),
      $container->get('logger.factory')->get('incident_schema'),
      $container->get('entity_type.manager'),
      $container->get('file_url_generator')
    );
  }

  public function get(Request $request): ResourceResponse {
    $storage = $this->entityTypeManager->getStorage('node');
    $ids = $storage->getQuery()
      ->accessCheck(true)
      ->condition('type', 'incident')
      ->sort('created', 'DESC')
      ->execute();

    $nodes = $storage->loadMultiple($ids);
    $incidents = [];

    foreach ($nodes as $node) {
      if ($node instanceof NodeInterface) {
        $incidents[] = $this->serializeIncident($node);
      }
    }

    return new ResourceResponse(['incidents' => $incidents], 200);
  }

  private function serializeIncident(NodeInterface $incident): array {
    return [
      'id' => (int) $incident->id(),
      'uuid' => $incident->uuid(),
      'title' => $incident->getTitle(),
      'created' => (int) $incident->getCreatedTime(),
      'incidentTime' => $this->getFieldValue($incident, 'field_incident_time'),
      'description' => $this->getFieldValue($incident, 'field_description'),
      'reporter' => $this->serializePerson($incident->get('field_reporter')->entity),
      'place' => $this->serializePlace($incident->get('field_place')->entity),
      'persons' => $this->serializePersons($incident->get('field_persons')->referencedEntities()),
      'photos' => $this->serializeImages($incident->get('field_photos')),
    ];
  }

  private function serializePersons(array $persons): array {
    $results = [];
    foreach ($persons as $person) {
      if ($person instanceof NodeInterface) {
        $results[] = $this->serializePerson($person);
      }
    }
    return $results;
  }

  private function serializePerson(?NodeInterface $person): ?array {
    if (!$person) {
      return null;
    }

    return [
      'id' => (int) $person->id(),
      'uuid' => $person->uuid(),
      'givenName' => $this->getFieldValue($person, 'field_given_name'),
      'familyName' => $this->getFieldValue($person, 'field_family_name'),
      'nameKnown' => $this->getFieldValue($person, 'field_name_known'),
      'employedBy' => $this->serializeOrganization($person->get('field_employed_by')->entity),
      'outfit' => $this->getFieldValue($person, 'field_outfit'),
      'hairColor' => $this->getFieldValue($person, 'field_hair_color'),
      'eyeColor' => $this->getFieldValue($person, 'field_eye_color'),
      'skinColor' => $this->getFieldValue($person, 'field_skin_color'),
      'photos' => $this->serializeImages($person->get('field_photos')),
    ];
  }

  private function serializeOrganization(?NodeInterface $org): ?array {
    if (!$org) {
      return null;
    }

    return [
      'id' => (int) $org->id(),
      'uuid' => $org->uuid(),
      'name' => $this->getFieldValue($org, 'field_name') ?? $org->getTitle(),
      'abbreviation' => $this->getFieldValue($org, 'field_abbreviation'),
    ];
  }

  private function serializePlace(?NodeInterface $place): ?array {
    if (!$place) {
      return null;
    }

    return [
      'id' => (int) $place->id(),
      'uuid' => $place->uuid(),
      'latitude' => $this->getFieldValue($place, 'field_latitude'),
      'longitude' => $this->getFieldValue($place, 'field_longitude'),
      'address' => $this->serializeAddress($place->get('field_address')->entity),
    ];
  }

  private function serializeAddress(?NodeInterface $address): ?array {
    if (!$address) {
      return null;
    }

    return [
      'id' => (int) $address->id(),
      'uuid' => $address->uuid(),
      'name' => $this->getFieldValue($address, 'field_name') ?? $address->getTitle(),
      'streetAddress' => $this->getFieldValue($address, 'field_street_address'),
      'locality' => $this->getFieldValue($address, 'field_address_locality'),
      'region' => $this->getFieldValue($address, 'field_address_region'),
      'postalCode' => $this->getFieldValue($address, 'field_postal_code'),
      'country' => $this->getFieldValue($address, 'field_address_country'),
    ];
  }

  private function serializeImages($field): array {
    $images = [];

    if (!$field) {
      return $images;
    }

    foreach ($field as $item) {
      if (!$item->entity instanceof FileInterface) {
        continue;
      }

      $file = $item->entity;
      $images[] = [
        'id' => (int) $file->id(),
        'uuid' => $file->uuid(),
        'alt' => $item->alt ?? '',
        'url' => $this->fileUrlGenerator->generateAbsoluteString($file->getFileUri()),
      ];
    }

    return $images;
  }

  private function getFieldValue(NodeInterface $entity, string $fieldName): ?string {
    if (!$entity->hasField($fieldName)) {
      return null;
    }

    $value = $entity->get($fieldName)->value ?? null;
    if ($value === null || $value === '') {
      return null;
    }

    return (string) $value;
  }
}
