<?php
include '../config/dbconfig.php';

// Allow from any origin
header("Access-Control-Allow-Origin: *");

// Allow specific HTTP methods
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

// Allow specific headers
header("Access-Control-Allow-Headers: Content-Type, Authorization");

try {
    // Get form data
    $user_id = $_POST['user_id'] ?? '';  // Get user_id from frontend
    $collection_id = $_POST['collection_id'] ?? '';
    $user_colc_data_id = $_POST['user_colc_data_id'] ?? '';
    $title = $_POST['title'] ?? '';
    $description = $_POST['description'] ?? '';
    $thumbnail = $_POST['thumbnail'] ?? '';
    $tags = $_POST['tags'] ?? '';
    $categories = $_POST['categories'] ?? '';
    $country = $_POST['country'] ?? '';
    $regions = $_POST['regions'] ?? '';

    // Validate required fields
    if (empty($user_id)) {
        throw new Exception('User ID is required');
    }

    if (empty($user_colc_data_id)) {
        throw new Exception('Collection data ID is required');
    }

    if (empty($title)) {
        throw new Exception('Title is required');
    }

    // Get individual item fields
    $itemFields = [];
    $itemValues = [];
    for ($i = 1; $i <= 10; $i++) {
        $itemFields[] = "item$i";
        $itemValues[":item$i"] = $_POST["item$i"] ?? null;
    }

    // Check for duplicate entry based on data_id
    $checkStmt = $shopcon->prepare("SELECT id FROM link_collections WHERE data_id = ? AND created_by = ? LIMIT 1");
    $checkStmt->execute([$user_colc_data_id, $user_id]);
    $exists = $checkStmt->fetch();

    if ($exists) {
        // If exists, update instead of insert
        $updateFields = [];
        foreach ($itemFields as $field) {
            $updateFields[] = "$field = :$field";
        }

        $sql = "UPDATE link_collections SET 
            title = :title,
            description = :description,
            featured_image = :featured_image,
            tags = :tags,
            category = :category,
            country_name = :country_name,
            region = :region,
            " . implode(", ", $updateFields) . ",
            updated_at = NOW(),
            updated_by = :updated_by
            WHERE data_id = :data_id AND created_by = :created_by";

        $stmt = $shopcon->prepare($sql);
        
        $success = $stmt->execute(array_merge([
            ':data_id' => $user_colc_data_id,
            ':title' => $title,
            ':description' => $description,
            ':featured_image' => $thumbnail,
            ':tags' => $tags,
            ':category' => $categories,
            ':country_name' => $country,
            ':region' => $regions,
            ':updated_by' => $user_id,
            ':created_by' => $user_id
        ], $itemValues));

        if ($success) {
            echo json_encode([
                'status' => true,
                'message' => 'success',
                'action' => 'updated'
            ]);
            exit;
        }
    }

    // If not exists, proceed with insert
    $sql = "INSERT INTO link_collections (
        data_id, 
        title, 
        description, 
        featured_image,
        tags,
        category,
        country_name,
        region,
        " . implode(", ", $itemFields) . ",
        status,
        verify_status,
        access_status,
        prevent_share,
        created_by,
        verified_by,
        created_at
    ) VALUES (
        :data_id,
        :title,
        :description,
        :featured_image,
        :tags,
        :category,
        :country_name,
        :region,
        " . implode(", ", array_map(fn($field) => ":$field", $itemFields)) . ",
        'active',
        'verified',
        'public',
        '1',
        :created_by,
        :created_by,
        NOW()
    )";

    $stmt = $shopcon->prepare($sql);
    
    // Execute with parameters
    $success = $stmt->execute(array_merge([
        ':data_id' => $user_colc_data_id,
        ':title' => $title,
        ':description' => $description,
        ':featured_image' => $thumbnail,
        ':tags' => $tags,
        ':category' => $categories,
        ':country_name' => $country,
        ':region' => $regions,
        ':created_by' => $user_id
    ], $itemValues));

    if ($success) {
        // Get the inserted ID
        $insertedId = $shopcon->lastInsertId();
        
        echo json_encode([
            'status' => true,
            'message' => 'success',
            'action' => 'inserted',
            'id' => $insertedId
        ]);
    } else {
        throw new Exception('Failed to insert data');
    }

} catch (PDOException $e) {
    error_log('Database Error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => false,
        'message' => 'Database error occurred',
        'error' => $e->getMessage()
    ]);
} catch (Exception $e) {
    error_log('Error: ' . $e->getMessage());
    http_response_code(400);
    echo json_encode([
        'status' => false,
        'message' => $e->getMessage()
    ]);
} 