BEGIN;

INSERT INTO "category" ("name")
SELECT seed.name
FROM (
  VALUES
    ('Hair'),
    ('Skin'),
    ('Spa')
) AS seed(name)
WHERE NOT EXISTS (
  SELECT 1
  FROM "category" existing
  WHERE lower(existing."name") = lower(seed.name)
);

WITH shop_owner_user_insert AS (
  INSERT INTO "users" (
    "username",
    "email",
    "phone",
    "is_active",
    "email_verified",
    "user_type_id"
  )
  SELECT
    'Glow Studio Owner',
    'demo.glow.owner@example.com',
    '9000001001',
    true,
    true,
    (
      SELECT id
      FROM "user_types"
      WHERE "name" = 'SHOPS'
      LIMIT 1
    )
  WHERE NOT EXISTS (
    SELECT 1 FROM "users" WHERE "email" = 'demo.glow.owner@example.com'
  )
  RETURNING "id"
),
shop_owner_user AS (
  SELECT "id" FROM shop_owner_user_insert
  UNION ALL
  SELECT "id" FROM "users" WHERE "email" = 'demo.glow.owner@example.com'
  LIMIT 1
),
customer_user_insert AS (
  INSERT INTO "users" (
    "username",
    "email",
    "phone",
    "is_active",
    "email_verified",
    "user_type_id"
  )
  SELECT
    'Priya Customer',
    'demo.customer@example.com',
    '9000001002',
    true,
    true,
    (
      SELECT id
      FROM "user_types"
      WHERE "name" = 'CUSTOMER'
      LIMIT 1
    )
  WHERE NOT EXISTS (
    SELECT 1 FROM "users" WHERE "email" = 'demo.customer@example.com'
  )
  RETURNING "id"
),
customer_user AS (
  SELECT "id" FROM customer_user_insert
  UNION ALL
  SELECT "id" FROM "users" WHERE "email" = 'demo.customer@example.com'
  LIMIT 1
),
shop_insert AS (
  INSERT INTO "shop_owners" (
    "user_id",
    "about",
    "address",
    "latitude",
    "longitude",
    "google_review_url",
    "is_onboarded",
    "opening_hours",
    "parlour_name",
    "place_id",
    "total_rating",
    "is_profile_completed",
    "shop_image"
  )
  SELECT
    shop_owner_user."id",
    'Demo salon for testing multi-service bookings and expert allocation.',
    '12 Residency Road, Bengaluru',
    12.9715987,
    77.5945627,
    'https://maps.google.com/?q=12+Residency+Road+Bengaluru',
    true,
    '{
      "monday":"10:00 AM - 08:00 PM",
      "tuesday":"10:00 AM - 08:00 PM",
      "wednesday":"10:00 AM - 08:00 PM",
      "thursday":"10:00 AM - 08:00 PM",
      "friday":"10:00 AM - 08:00 PM",
      "saturday":"10:00 AM - 09:00 PM",
      "sunday":"11:00 AM - 07:00 PM"
    }'::json,
    'Glow Studio Demo',
    NULL,
    5,
    true,
    'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=900&q=80'
  FROM shop_owner_user
  WHERE NOT EXISTS (
    SELECT 1
    FROM "shop_owners"
    WHERE "user_id" = shop_owner_user."id"
  )
  RETURNING "id"
),
shop_ref AS (
  SELECT "id" FROM shop_insert
  UNION ALL
  SELECT "id"
  FROM "shop_owners"
  WHERE "user_id" = (SELECT "id" FROM shop_owner_user)
  LIMIT 1
)
INSERT INTO "services" (
  "name",
  "image_url",
  "rate",
  "shop_id",
  "category_id",
  "description",
  "duration"
)
SELECT
  seed."name",
  seed."image_url",
  seed."rate",
  shop_ref."id",
  (
    SELECT category."id"
    FROM "category"
    WHERE lower(category."name") = lower(seed."category_name")
    LIMIT 1
  ),
  seed."description",
  seed."duration"
FROM shop_ref
CROSS JOIN (
  VALUES
    (
      'Classic Hair Cut',
      'https://images.unsplash.com/photo-1517832606299-7ae9b720a186?auto=format&fit=crop&w=900&q=80',
      399,
      'Hair',
      'Precision haircut with wash and basic styling.',
      '45'
    ),
    (
      'Beard Trim And Shape',
      'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=900&q=80',
      249,
      'Hair',
      'Detailed beard trim with shaping and finishing.',
      '30'
    ),
    (
      'Hair Spa Ritual',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=900&q=80',
      899,
      'Spa',
      'Deep conditioning spa treatment for damaged hair.',
      '60'
    ),
    (
      'Glow Cleanup Facial',
      'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=900&q=80',
      1199,
      'Skin',
      'Brightening facial cleanup with massage and mask.',
      '75'
    )
) AS seed("name", "image_url", "rate", "category_name", "description", "duration")
WHERE NOT EXISTS (
  SELECT 1
  FROM "services" existing
  WHERE existing."shop_id" = shop_ref."id"
    AND lower(existing."name") = lower(seed."name")
);

WITH shop_ref AS (
  SELECT "id"
  FROM "shop_owners"
  WHERE "parlour_name" = 'Glow Studio Demo'
  LIMIT 1
)
INSERT INTO "experts" (
  "shop_id",
  "name",
  "about",
  "address",
  "image",
  "specialist",
  "is_active"
)
SELECT
  shop_ref."id",
  seed."name",
  seed."about",
  '12 Residency Road, Bengaluru',
  seed."image",
  seed."specialist",
  true
FROM shop_ref
CROSS JOIN (
  VALUES
    (
      'Anita Sharma',
      'Senior stylist who handles cuts, beard grooming, and hair spa sessions.',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80',
      'Hair'
    ),
    (
      'Meera Nair',
      'Skin specialist focused on cleanup, facials, and glow treatments.',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=900&q=80',
      'Skin'
    )
) AS seed("name", "about", "image", "specialist")
WHERE NOT EXISTS (
  SELECT 1
  FROM "experts" existing
  WHERE existing."shop_id" = shop_ref."id"
    AND lower(existing."name") = lower(seed."name")
);

WITH shop_ref AS (
  SELECT "id"
  FROM "shop_owners"
  WHERE "parlour_name" = 'Glow Studio Demo'
  LIMIT 1
),
expert_ref AS (
  SELECT "id", "name"
  FROM "experts"
  WHERE "shop_id" = (SELECT "id" FROM shop_ref)
),
service_ref AS (
  SELECT "id", "name"
  FROM "services"
  WHERE "shop_id" = (SELECT "id" FROM shop_ref)
)
INSERT INTO "expert_services" ("expert_id", "service_id")
SELECT
  expert_ref."id",
  service_ref."id"
FROM (
  VALUES
    ('Anita Sharma', 'Classic Hair Cut'),
    ('Anita Sharma', 'Beard Trim And Shape'),
    ('Anita Sharma', 'Hair Spa Ritual'),
    ('Meera Nair', 'Glow Cleanup Facial')
) AS mapping("expert_name", "service_name")
INNER JOIN expert_ref
  ON lower(expert_ref."name") = lower(mapping."expert_name")
INNER JOIN service_ref
  ON lower(service_ref."name") = lower(mapping."service_name")
WHERE NOT EXISTS (
  SELECT 1
  FROM "expert_services" existing
  WHERE existing."expert_id" = expert_ref."id"
    AND existing."service_id" = service_ref."id"
);

WITH shop_ref AS (
  SELECT "id"
  FROM "shop_owners"
  WHERE "parlour_name" = 'Glow Studio Demo'
  LIMIT 1
)
INSERT INTO "slots" (
  "shop_id",
  "slot_date",
  "start_time",
  "end_time",
  "max_capacity",
  "booked_count",
  "is_available",
  "is_recurring"
)
SELECT
  shop_ref."id",
  seed."slot_date",
  seed."start_time",
  seed."end_time",
  3,
  0,
  true,
  false
FROM shop_ref
CROSS JOIN (
  VALUES
    ((CURRENT_DATE + INTERVAL '1 day')::date, '10:00:00'::time, '10:45:00'::time),
    ((CURRENT_DATE + INTERVAL '1 day')::date, '11:00:00'::time, '11:45:00'::time),
    ((CURRENT_DATE + INTERVAL '1 day')::date, '12:00:00'::time, '12:45:00'::time),
    ((CURRENT_DATE + INTERVAL '2 day')::date, '10:00:00'::time, '10:45:00'::time),
    ((CURRENT_DATE + INTERVAL '2 day')::date, '11:00:00'::time, '11:45:00'::time),
    ((CURRENT_DATE + INTERVAL '3 day')::date, '04:00:00'::time, '04:45:00'::time)
) AS seed("slot_date", "start_time", "end_time")
WHERE NOT EXISTS (
  SELECT 1
  FROM "slots" existing
  WHERE existing."shop_id" = shop_ref."id"
    AND existing."slot_date" = seed."slot_date"
    AND existing."start_time" = seed."start_time"
    AND existing."end_time" = seed."end_time"
);

WITH shop_ref AS (
  SELECT "id"
  FROM "shop_owners"
  WHERE "parlour_name" = 'Glow Studio Demo'
  LIMIT 1
),
customer_ref AS (
  SELECT "id"
  FROM "users"
  WHERE "email" = 'demo.customer@example.com'
  LIMIT 1
),
expert_ref AS (
  SELECT "id"
  FROM "experts"
  WHERE "shop_id" = (SELECT "id" FROM shop_ref)
    AND "name" = 'Anita Sharma'
  LIMIT 1
),
slot_ref AS (
  SELECT "id"
  FROM "slots"
  WHERE "shop_id" = (SELECT "id" FROM shop_ref)
  ORDER BY "slot_date", "start_time"
  LIMIT 1
),
service_ref AS (
  SELECT "id", "name", "rate"
  FROM "services"
  WHERE "shop_id" = (SELECT "id" FROM shop_ref)
    AND "name" IN ('Classic Hair Cut', 'Hair Spa Ritual')
),
appointment_insert AS (
  INSERT INTO "appointments" (
    "status_id",
    "customer_id",
    "expert_id",
    "slot_id",
    "shop_id",
    "rate",
    "service_ids"
  )
  SELECT
    (
      SELECT "id"
      FROM "appointment_status"
      WHERE "name" = 'pending'
      LIMIT 1
    ),
    customer_ref."id",
    expert_ref."id",
    slot_ref."id",
    shop_ref."id",
    COALESCE((SELECT SUM("rate") FROM service_ref), 0),
    (
      SELECT json_agg(service_ref."id" ORDER BY service_ref."id")
      FROM service_ref
    )
  FROM shop_ref
  CROSS JOIN customer_ref
  CROSS JOIN expert_ref
  CROSS JOIN slot_ref
  WHERE NOT EXISTS (
    SELECT 1
    FROM "appointments" existing
    WHERE existing."customer_id" = customer_ref."id"
      AND existing."slot_id" = slot_ref."id"
      AND existing."expert_id" = expert_ref."id"
  )
  RETURNING "id"
)
INSERT INTO "appointment_services" ("appointment_id", "service_id")
SELECT
  appointment_insert."id",
  service_ref."id"
FROM appointment_insert
CROSS JOIN service_ref
WHERE NOT EXISTS (
  SELECT 1
  FROM "appointment_services" existing
  WHERE existing."appointment_id" = appointment_insert."id"
    AND existing."service_id" = service_ref."id"
);

COMMIT;
