-- phpMyAdmin SQL Dump
-- version 6.0.0-dev+20251202.40f7317dad
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Aug 23, 2026 at 03:19 PM
-- Server version: 8.4.3
-- PHP Version: 8.4.24

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `landingpage`
--

-- --------------------------------------------------------

--
-- Table structure for table `brands`
--

CREATE TABLE `brands` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `brands`
--

INSERT INTO `brands` (`id`, `name`, `slug`, `created_at`, `updated_at`) VALUES
(1, 'Alpicool', 'alpicool', '2026-08-23 08:18:11', '2026-08-23 08:18:11');

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cache`
--

INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES
('laravel-cache-settings.all', 'a:12:{s:12:\"home_content\";s:1582:\"{\"en\":{\"hero\":{\"badge\":\"New Season · Phhh\",\"title_before\":\"Discodgf\",\"title_accent\":\"Fuffg\",\"title_after\":\"of Electrdg\",\"subtitle\":\"Shop phgffestyle.\",\"cta\":\"SHOdWdf\",\"explore\":\"Explordhhhhhhhhhhhhhhh\",\"image\":\"http:\\/\\/localhost:8000\\/storage\\/home\\/K4Hf4K8TLsHhaLRqif4Mq3wJmdsoZXfA4UBu3P9N.jpg\",\"image_alt\":\"Featured eterfdgdfgnics\",\"free_shipping\":\"Free shisgfdfdgvv sg\",\"on_every_order\":\"On edhghf\"},\"guarantees\":{\"shipping\":{\"title\":\"Free Shipping\",\"text\":\"On every order, straight to your door.\"},\"warranty\":{\"title\":\"{months}-Month Warranty\",\"year\":\"1-Year Warranty\",\"text\":\"Official coverage on all defects.\"},\"returns\":{\"title\":\"30-Day Returns\",\"text\":\"Changed your mind? No problem.\"}}},\"ar\":{\"hero\":{\"badge\":\"موسم جديد · تقنيات مميزة 444\",\"title_before\":\"اtف\",\"title_accent\":\"المستzerz\",\"title_after\":\"مdgت.\",\"subtitle\":\"تسوّdfhت المميزة، المنتقاة بعناية لتناسب أسلوب حياتك.\",\"cta\":\"gdلآن\",\"explore\":\"اس reter\",\"image\":\"http:\\/\\/localhost:8000\\/storage\\/home\\/K4Hf4K8TLsHhaLRqif4Mq3wJmdsoZXfA4UBu3P9N.jpg\",\"image_alt\":\"ezzzzzzzzزة\",\"free_shipping\":\"شحن مجانيhdfdfhgfh\",\"on_every_order\":\"hghfكل الطلبات\"},\"guarantees\":{\"shipping\":{\"title\":\"شحن مجاني\",\"text\":\"على كل طلب، حتى باب منزلك.\"},\"warranty\":{\"title\":\"{months} شهر ضمان\",\"year\":\"سنة واحدة ضمان\",\"text\":\"تغطية رسمية شاملة لعيوب الصناعة.\"},\"returns\":{\"title\":\"إرجاع خلال 30 يوماً\",\"text\":\"غيّرت رأيك؟ لا مشكلة.\"}}}}\";s:13:\"home_sections\";s:77:\"{\"hero\":true,\"collections\":true,\"promo\":true,\"favorites\":true,\"stories\":true}\";s:10:\"promo_code\";s:9:\"PORTAGE10\";s:13:\"promo_percent\";s:1:\"2\";s:11:\"promo_title\";s:56:\"Instagram Exclusive — Extra 2% Off with Code PORTAGE10\";s:14:\"promo_title_ar\";s:81:\"حصري على إنستغرام — خصم إضافي {percent}% بكود {code}\";s:13:\"shipping_cost\";s:1:\"0\";s:10:\"store_name\";s:12:\"PortageStore\";s:13:\"support_email\";s:21:\"support@portage.store\";s:13:\"support_phone\";s:15:\"+1 555 010 2030\";s:12:\"testimonials\";s:1519:\"{\"en\":[{\"name\":\"Sarah M.\",\"location\":\"Casablanca\",\"rating\":5,\"title\":\"Better than expected\",\"text\":\"Ordered on Monday, delivered Wednesday with cash on delivery. The build quality genuinely surprised me — these feel twice their price.\"},{\"name\":\"Omar K.\",\"location\":\"Dubai\",\"rating\":5,\"title\":\"The battery life is real\",\"text\":\"I get a solid week of use before charging. Sound is clean and balanced, and pairing takes two seconds.\"},{\"name\":\"Lina R.\",\"location\":\"Tunis\",\"rating\":4,\"title\":\"Great value, elegant design\",\"text\":\"It looks beautiful on my desk and the app is refreshingly simple. Support answered my question within an hour.\"}],\"ar\":[{\"name\":\"سارة م.\",\"location\":\"الدار البيضاء\",\"rating\":5,\"title\":\"أفضل من المتوقع\",\"text\":\"طلبت يوم الاثنين ووصلني الطلب يوم الأربعاء مع الدفع عند الاستلام. جودة التصنيع فاجأتني فعلاً — يبدو أنها بضعف سعرها.\"},{\"name\":\"عمر ك.\",\"location\":\"دبي\",\"rating\":5,\"title\":\"عمر البطارية حقيقي\",\"text\":\"أستخدمه أسبوعاً كاملاً قبل الشحن. الصوت نقي ومتوازن، والاقتران يستغرق ثانيتين فقط.\"},{\"name\":\"لينا ر.\",\"location\":\"تونس\",\"rating\":4,\"title\":\"قيمة رائعة وتصميم أنيق\",\"text\":\"يبدو جميلاً على مكتبي والتطبيق بسيط بشكل منعش. خدمة العملاء أجابت على سؤالي خلال ساعة.\"}]}\";s:17:\"testimonials_mode\";s:7:\"default\";}', 1787498539);

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `parent_id` bigint UNSIGNED DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `image_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `show_in_collections` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `parent_id`, `sort_order`, `image_path`, `show_in_collections`, `created_at`, `updated_at`) VALUES
(1, 'Electronics & Accessories', 'electronics-accessories', NULL, NULL, 0, NULL, 1, '2026-08-23 08:16:59', '2026-08-23 11:13:13'),
(2, 'Automotive', 'automotive', NULL, NULL, 0, NULL, 1, '2026-08-23 08:17:05', '2026-08-23 11:13:08'),
(3, 'Home Appliances', 'home-appliances', NULL, NULL, 0, NULL, 1, '2026-08-23 08:17:09', '2026-08-23 11:13:14'),
(4, 'Furniture', 'furniture', NULL, NULL, 0, NULL, 1, '2026-08-23 08:17:13', '2026-08-23 11:13:11');

-- --------------------------------------------------------

--
-- Table structure for table `currencies`
--

CREATE TABLE `currencies` (
  `id` bigint UNSIGNED NOT NULL,
  `code` varchar(3) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `currencies`
--

INSERT INTO `currencies` (`id`, `code`, `name`, `created_at`, `updated_at`) VALUES
(1, 'QAR', 'Qatari Riyal', NULL, NULL),
(2, 'USD', 'US Dollar', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` bigint UNSIGNED NOT NULL,
  `first_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint UNSIGNED NOT NULL,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `inventory_batches`
--

CREATE TABLE `inventory_batches` (
  `id` bigint UNSIGNED NOT NULL,
  `product_id` bigint UNSIGNED NOT NULL,
  `supplier_id` bigint UNSIGNED DEFAULT NULL,
  `batch_number` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity_received` int UNSIGNED NOT NULL,
  `quantity_remaining` int UNSIGNED NOT NULL,
  `purchase_price` decimal(12,2) NOT NULL,
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'USD',
  `arrival_date` date NOT NULL,
  `supplier_invoice_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `inventory_movements`
--

CREATE TABLE `inventory_movements` (
  `id` bigint UNSIGNED NOT NULL,
  `product_id` bigint UNSIGNED NOT NULL,
  `batch_id` bigint UNSIGNED DEFAULT NULL,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int NOT NULL,
  `reference_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_id` bigint UNSIGNED DEFAULT NULL,
  `reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` bigint UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint UNSIGNED NOT NULL,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` smallint UNSIGNED NOT NULL,
  `reserved_at` int UNSIGNED DEFAULT NULL,
  `available_at` int UNSIGNED NOT NULL,
  `created_at` int UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int UNSIGNED NOT NULL,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2026_08_21_235113_create_personal_access_tokens_table', 1),
(5, '2026_08_22_000001_create_catalog_tables', 1),
(6, '2026_08_22_000002_create_inventory_tables', 1),
(7, '2026_08_22_000003_create_sales_tables', 1),
(8, '2026_08_22_000004_create_settings_tables', 1),
(9, '2026_08_23_000000_create_currencies_table', 2),
(10, '2026_08_23_000001_add_image_to_categories_table', 3),
(11, '2026_08_23_000002_add_show_in_collections_to_categories_table', 3);

-- --------------------------------------------------------

--
-- Table structure for table `newsletter_subscribers`
--

CREATE TABLE `newsletter_subscribers` (
  `id` bigint UNSIGNED NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` bigint UNSIGNED NOT NULL,
  `order_number` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_id` bigint UNSIGNED NOT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `payment_method` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'COD',
  `payment_status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `shipping_method` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'STANDARD',
  `shipping_status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `subtotal` decimal(12,2) NOT NULL DEFAULT '0.00',
  `shipping_cost` decimal(12,2) NOT NULL DEFAULT '0.00',
  `discount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `total` decimal(12,2) NOT NULL DEFAULT '0.00',
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'USD',
  `source` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DIRECT',
  `utm_source` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `utm_medium` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `utm_campaign` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `utm_content` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `utm_term` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `discount_code` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer_notes` text COLLATE utf8mb4_unicode_ci,
  `internal_notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` bigint UNSIGNED NOT NULL,
  `order_id` bigint UNSIGNED NOT NULL,
  `product_id` bigint UNSIGNED DEFAULT NULL,
  `product_variant_id` bigint UNSIGNED DEFAULT NULL,
  `product_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `variant_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sku` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantity` int UNSIGNED NOT NULL,
  `unit_price` decimal(12,2) NOT NULL,
  `discount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `total` decimal(12,2) NOT NULL,
  `warranty_months` int UNSIGNED NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint UNSIGNED NOT NULL,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(1, 'App\\Models\\User', 1, 'admin-dashboard', '36f01cd95859a85672194ccfa80914cddb74b7049428ab672ef977ec235f01e2', '[\"*\"]', '2026-08-23 11:02:54', NULL, '2026-08-23 08:09:44', '2026-08-23 11:02:54'),
(2, 'App\\Models\\User', 1, 'admin-dashboard', 'eee0cbee9612d5fbba22ac47ded6f0996d1790fe26e40365bcea74ec116180c1', '[\"*\"]', '2026-08-23 11:36:22', NULL, '2026-08-23 11:06:44', '2026-08-23 11:36:22'),
(3, 'App\\Models\\User', 1, 'admin-dashboard', '19a01e978092d10aef66479cbdd42b2d24ef44c4f7ff5d9bc486bc2b0a628834', '[\"*\"]', '2026-08-23 12:22:17', NULL, '2026-08-23 11:52:12', '2026-08-23 12:22:17'),
(4, 'App\\Models\\User', 1, 'admin-dashboard', '5068b618c1e12f05276b4bcad1d2cc06da07ca19344951ed54721c400107aa8a', '[\"*\"]', '2026-08-23 12:03:43', NULL, '2026-08-23 12:02:03', '2026-08-23 12:03:43'),
(5, 'App\\Models\\User', 1, 'admin-dashboard', '4fa1d5ea9fa57efb7540846ef0b4641bc1993462cd9d4fe9cc2126e772e12465', '[\"*\"]', '2026-08-23 14:17:14', NULL, '2026-08-23 12:23:39', '2026-08-23 14:17:14'),
(6, 'App\\Models\\User', 2, 'admin-dashboard', '928342bbedab9949bcebfcd133d5e58f18ab4d56f5298a1d398eaf71ba863f71', '[\"*\"]', '2026-08-23 12:35:33', NULL, '2026-08-23 12:35:32', '2026-08-23 12:35:33'),
(7, 'App\\Models\\User', 2, 'admin-dashboard', '9c031bebc1ca1230ea7b3b8a0ba69ac68f6c3d9378f6fd9f965e5201a617cf04', '[\"*\"]', '2026-08-23 12:35:54', NULL, '2026-08-23 12:35:54', '2026-08-23 12:35:54');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` bigint UNSIGNED NOT NULL,
  `sku` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `barcode` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `features` json DEFAULT NULL,
  `brand_id` bigint UNSIGNED DEFAULT NULL,
  `category_id` bigint UNSIGNED DEFAULT NULL,
  `selling_price` decimal(12,2) NOT NULL,
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'USD',
  `warranty_months` int UNSIGNED NOT NULL DEFAULT '12',
  `stock_quantity` int NOT NULL DEFAULT '0',
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `badge` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_featured` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `sku`, `barcode`, `name`, `slug`, `description`, `features`, `brand_id`, `category_id`, `selling_price`, `currency`, `warranty_months`, `stock_quantity`, `status`, `badge`, `is_featured`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, '1', NULL, 'WST Mini Power Bank Docking Station 5000mAh', 'wst-mini-power-bank-docking-station-5000mah', '\"EN: Mini Power Bank Docking Station 5000mAh with charging base. Features WST intelligent heat-control technology, rapid recharge (twice as fast as other portable chargers), premium-grade components, and SmartVOLT advanced technology.\n\nAR: محطة شحن مع باور بانك صغير بسعة 5000mAh وقاعدة شحن. تتميز بتقنية WST الذكية للتحكم بالحرارة، وإعادة شحن سريعة (أسرع بمرتين من الشواحن المحمولة الأخرى)، ومكونات عالية الجودة، وتقنية SmartVOLT المتقدمة.\"', NULL, NULL, 1, 280.00, 'QAR', 12, 0, 'ACTIVE', 'BEST_SELLER', 1, '2026-08-23 08:21:11', '2026-08-23 10:44:36', NULL),
(5, '2', NULL, 'Fridge 60 Liters', 'fridge-60-liters', '\"The Alpicool LGT60 Flexible Dual Zone Portable Car Fridge features a flexible dual zone design, LG compressor for fast cooling, and a -4℉ to 68℉ cooling range. With mobile app control, this fridge offers convenience and versatility for any outdoor adventure. Measuring at 28.5 x 14.2 x 21.4 inches, it has a large capacity of 60L/63QT (remove divider) or 56.5L/60QT (insert divider). Stay cool and organized on the go with this innovative car fridge.\nGarantee for one year .\"', NULL, 1, 3, 1950.00, 'QAR', 12, 0, 'ACTIVE', NULL, 1, '2026-08-23 08:37:43', '2026-08-23 10:44:29', NULL),
(6, '3', NULL, '12V Electric Hydraulic Car Jack Kit – 5 Ton', '12v-electric-hydraulic-car-jack-kit-5-ton', '\"EN: 12V electric hydraulic car jack with one-button automatic lifting, suitable for most vehicles. Includes a built-in air inflator and LED light, plus an electric impact wrench and accessories in a portable carrying case. Lifting range shown: 155–450 mm.\n\nAR: ⚡ رافعة كهربائية 12V ترفع السيارة تلقائيًا بضغطة زر، مع منفاخ هواء وإضاءة LED مدمجة. تتضمن أيضًا مفتاح صدمات كهربائي وملحقات داخل حقيبة حمل. نطاق الرفع الموضح: 155–450 مم.\"', NULL, NULL, 2, 520.00, 'QAR', 12, 0, 'ACTIVE', NULL, 1, '2026-08-23 08:40:30', '2026-08-23 10:44:22', NULL),
(7, '4', NULL, 'Multifunctional Laptop Table -T8', 'multifunctional-laptop-table-t8', 'Laptop Stand Portable T8 :It is tough and flexible, due to different venues, uses, and objects, such as Transformers Variety as its body. Occasion: Sofa, Carpet, Grass Lawn, Desk, Bed. The side of the three can be rotated with 360 folding legs. The same lower limb has two legs, each leg has three stubs, and sub-human legs feet, legs, and thighs are the same. Product Features: This is a compact design, superb craftsmanship, and a user-friendly high laptop desk, At the same time, it also can be used for other purposes. Use: Computer Desk, Drawing Board desk, Flower shelf desk. Object: Adults and children', NULL, NULL, 4, 239.00, 'QAR', 12, 0, 'ACTIVE', 'NEW_ARRIVAL', 1, '2026-08-23 08:42:59', '2026-08-23 10:44:15', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `product_images`
--

CREATE TABLE `product_images` (
  `id` bigint UNSIGNED NOT NULL,
  `product_id` bigint UNSIGNED NOT NULL,
  `image_path` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `alt_text` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort_order` int UNSIGNED NOT NULL DEFAULT '0',
  `is_primary` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_images`
--

INSERT INTO `product_images` (`id`, `product_id`, `image_path`, `alt_text`, `sort_order`, `is_primary`, `created_at`, `updated_at`) VALUES
(5, 1, 'products/1/1CESGz7ZYUZxEyASRRbJ9PbxGrFY8A06X2SIZQjA.jpg', 'WST Mini Power Bank Docking Station 5000mAh', 1, 1, '2026-08-23 08:33:04', '2026-08-23 08:33:04'),
(6, 1, 'products/1/YwbqJMprKmyayQxnvv2sIKcgMXDUUXSURzKw9V2f.jpg', 'WST Mini Power Bank Docking Station 5000mAh', 2, 0, '2026-08-23 08:33:04', '2026-08-23 08:33:04'),
(8, 5, 'products/5/rlOlYfOLHHnkvu22rJQs5LoYGhMvgvOWRb3xO1Fu.jpg', 'Fridge 60 Liters', 2, 0, '2026-08-23 08:38:54', '2026-08-23 08:38:54'),
(9, 5, 'products/5/5y4K5ZGKwsPvTyKYHo51Cwi1uaq6EXqdRK0rFXTO.jpg', 'Fridge 60 Liters', 3, 0, '2026-08-23 08:38:54', '2026-08-23 08:38:54'),
(10, 5, 'products/5/iVSCvU12XgnpZWTDIGE4wETbmbgjq0rcZ7MH39zB.jpg', 'Fridge 60 Liters', 4, 0, '2026-08-23 08:39:22', '2026-08-23 08:39:22'),
(11, 6, 'products/6/ReJyhN09XGrSWwIMEvqaapfKYMNMxFxUE6IZ65gk.jpg', '12V Electric Hydraulic Car Jack Kit – 5 Ton', 1, 1, '2026-08-23 08:41:03', '2026-08-23 08:41:03'),
(12, 6, 'products/6/ExBuq2mHHW5ZLVwlYnCa6VcaghuigpscGRM3G89A.jpg', '12V Electric Hydraulic Car Jack Kit – 5 Ton', 2, 0, '2026-08-23 08:41:03', '2026-08-23 08:41:03'),
(13, 6, 'products/6/oYZVnIJDjlStdtsR5KLtTDFiC1kp0ZkyABcZkvZ0.jpg', '12V Electric Hydraulic Car Jack Kit – 5 Ton', 3, 0, '2026-08-23 08:41:03', '2026-08-23 08:41:03'),
(14, 6, 'products/6/WT2zD6YJDoxQqKMIidbQZf1Dr4TjNSkQbHPU7ndP.jpg', '12V Electric Hydraulic Car Jack Kit – 5 Ton', 4, 0, '2026-08-23 08:41:08', '2026-08-23 08:41:08'),
(17, 7, 'products/7/ewOgw9l0rAB2YRjapQfsjYU0NorK6xAavISIEz5Z.png', 'Multifunctional Laptop Table -T8', 3, 0, '2026-08-23 08:43:18', '2026-08-23 08:43:18'),
(18, 7, 'products/7/NyKE3DfJ0elcLtxKfDCaJiXZG03bcK9R8qWjDq66.jpg', 'Multifunctional Laptop Table -T8', 4, 0, '2026-08-23 08:43:32', '2026-08-23 08:43:32'),
(19, 7, 'products/7/tZaD13deVCukEaZSrQ6R3V35hEMAitwtkG8D1Ah3.jpg', 'Multifunctional Laptop Table -T8', 5, 0, '2026-08-23 08:43:32', '2026-08-23 08:43:32');

-- --------------------------------------------------------

--
-- Table structure for table `product_prices`
--

CREATE TABLE `product_prices` (
  `id` bigint UNSIGNED NOT NULL,
  `product_id` bigint UNSIGNED NOT NULL,
  `price` decimal(12,2) NOT NULL,
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'USD',
  `valid_from` timestamp NOT NULL,
  `valid_to` timestamp NULL DEFAULT NULL,
  `reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` bigint UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_prices`
--

INSERT INTO `product_prices` (`id`, `product_id`, `price`, `currency`, `valid_from`, `valid_to`, `reason`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 1, 280.00, 'USD', '2026-08-23 08:26:46', '2026-08-23 10:44:36', 'mistake', 1, '2026-08-23 08:26:46', '2026-08-23 10:44:36'),
(2, 6, 519.98, 'USD', '2026-08-23 08:40:30', '2026-08-23 08:40:48', 'INITIAL_PRICE', NULL, '2026-08-23 08:40:30', '2026-08-23 08:40:48'),
(3, 6, 520.00, 'USD', '2026-08-23 08:40:48', '2026-08-23 10:44:22', 'PRICE_UPDATE', 1, '2026-08-23 08:40:48', '2026-08-23 10:44:22'),
(4, 7, 239.00, 'USD', '2026-08-23 08:42:59', '2026-08-23 10:44:15', 'INITIAL_PRICE', NULL, '2026-08-23 08:42:59', '2026-08-23 10:44:15'),
(5, 7, 239.00, 'QAR', '2026-08-23 10:44:15', NULL, 'CURRENCY_CHANGE', NULL, '2026-08-23 10:44:15', '2026-08-23 10:44:15'),
(6, 6, 520.00, 'QAR', '2026-08-23 10:44:22', NULL, 'CURRENCY_CHANGE', NULL, '2026-08-23 10:44:22', '2026-08-23 10:44:22'),
(7, 5, 1950.00, 'QAR', '2026-08-23 10:44:29', NULL, 'CURRENCY_CHANGE', NULL, '2026-08-23 10:44:29', '2026-08-23 10:44:29'),
(8, 1, 280.00, 'QAR', '2026-08-23 10:44:36', NULL, 'CURRENCY_CHANGE', NULL, '2026-08-23 10:44:36', '2026-08-23 10:44:36');

-- --------------------------------------------------------

--
-- Table structure for table `product_variants`
--

CREATE TABLE `product_variants` (
  `id` bigint UNSIGNED NOT NULL,
  `product_id` bigint UNSIGNED NOT NULL,
  `sku` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `barcode` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(12,2) DEFAULT NULL,
  `sort_order` int UNSIGNED NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `returns`
--

CREATE TABLE `returns` (
  `id` bigint UNSIGNED NOT NULL,
  `order_id` bigint UNSIGNED NOT NULL,
  `customer_id` bigint UNSIGNED NOT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'REQUESTED',
  `reason` text COLLATE utf8mb4_unicode_ci,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `return_items`
--

CREATE TABLE `return_items` (
  `id` bigint UNSIGNED NOT NULL,
  `return_id` bigint UNSIGNED NOT NULL,
  `order_item_id` bigint UNSIGNED NOT NULL,
  `product_id` bigint UNSIGNED DEFAULT NULL,
  `quantity` int UNSIGNED NOT NULL,
  `condition` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `action` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `restocked` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`key`, `value`, `created_at`, `updated_at`) VALUES
('home_content', '{\"en\":{\"hero\":{\"badge\":\"New Season · Phhh\",\"title_before\":\"Discodgf\",\"title_accent\":\"Fuffg\",\"title_after\":\"of Electrdg\",\"subtitle\":\"Shop phgffestyle.\",\"cta\":\"SHOdWdf\",\"explore\":\"Explordhhhhhhhhhhhhhhh\",\"image\":\"http:\\/\\/localhost:8000\\/storage\\/home\\/K4Hf4K8TLsHhaLRqif4Mq3wJmdsoZXfA4UBu3P9N.jpg\",\"image_alt\":\"Featured eterfdgdfgnics\",\"free_shipping\":\"Free shisgfdfdgvv sg\",\"on_every_order\":\"On edhghf\"},\"guarantees\":{\"shipping\":{\"title\":\"Free Shipping\",\"text\":\"On every order, straight to your door.\"},\"warranty\":{\"title\":\"{months}-Month Warranty\",\"year\":\"1-Year Warranty\",\"text\":\"Official coverage on all defects.\"},\"returns\":{\"title\":\"30-Day Returns\",\"text\":\"Changed your mind? No problem.\"}}},\"ar\":{\"hero\":{\"badge\":\"موسم جديد · تقنيات مميزة 444\",\"title_before\":\"اtف\",\"title_accent\":\"المستzerz\",\"title_after\":\"مdgت.\",\"subtitle\":\"تسوّdfhت المميزة، المنتقاة بعناية لتناسب أسلوب حياتك.\",\"cta\":\"gdلآن\",\"explore\":\"اس reter\",\"image\":\"http:\\/\\/localhost:8000\\/storage\\/home\\/K4Hf4K8TLsHhaLRqif4Mq3wJmdsoZXfA4UBu3P9N.jpg\",\"image_alt\":\"ezzzzzzzzزة\",\"free_shipping\":\"شحن مجانيhdfdfhgfh\",\"on_every_order\":\"hghfكل الطلبات\"},\"guarantees\":{\"shipping\":{\"title\":\"شحن مجاني\",\"text\":\"على كل طلب، حتى باب منزلك.\"},\"warranty\":{\"title\":\"{months} شهر ضمان\",\"year\":\"سنة واحدة ضمان\",\"text\":\"تغطية رسمية شاملة لعيوب الصناعة.\"},\"returns\":{\"title\":\"إرجاع خلال 30 يوماً\",\"text\":\"غيّرت رأيك؟ لا مشكلة.\"}}}}', '2026-08-23 11:30:56', '2026-08-23 12:40:07'),
('home_sections', '{\"hero\":true,\"collections\":true,\"promo\":true,\"favorites\":true,\"stories\":true}', '2026-08-23 11:58:37', '2026-08-23 12:23:54'),
('promo_code', 'PORTAGE10', '2026-08-23 11:30:55', '2026-08-23 11:30:55'),
('promo_percent', '2', '2026-08-23 11:30:55', '2026-08-23 11:35:01'),
('promo_title', 'Instagram Exclusive — Extra 2% Off with Code PORTAGE10', '2026-08-23 11:30:56', '2026-08-23 11:35:01'),
('promo_title_ar', 'حصري على إنستغرام — خصم إضافي {percent}% بكود {code}', '2026-08-23 11:30:56', '2026-08-23 11:30:56'),
('shipping_cost', '0', '2026-08-23 11:30:56', '2026-08-23 11:30:56'),
('store_name', 'PortageStore', '2026-08-23 11:30:55', '2026-08-23 11:35:01'),
('support_email', 'support@portage.store', '2026-08-23 11:30:56', '2026-08-23 11:30:56'),
('support_phone', '+1 555 010 2030', '2026-08-23 11:30:56', '2026-08-23 11:30:56'),
('testimonials', '{\"en\":[{\"name\":\"Sarah M.\",\"location\":\"Casablanca\",\"rating\":5,\"title\":\"Better than expected\",\"text\":\"Ordered on Monday, delivered Wednesday with cash on delivery. The build quality genuinely surprised me — these feel twice their price.\"},{\"name\":\"Omar K.\",\"location\":\"Dubai\",\"rating\":5,\"title\":\"The battery life is real\",\"text\":\"I get a solid week of use before charging. Sound is clean and balanced, and pairing takes two seconds.\"},{\"name\":\"Lina R.\",\"location\":\"Tunis\",\"rating\":4,\"title\":\"Great value, elegant design\",\"text\":\"It looks beautiful on my desk and the app is refreshingly simple. Support answered my question within an hour.\"}],\"ar\":[{\"name\":\"سارة م.\",\"location\":\"الدار البيضاء\",\"rating\":5,\"title\":\"أفضل من المتوقع\",\"text\":\"طلبت يوم الاثنين ووصلني الطلب يوم الأربعاء مع الدفع عند الاستلام. جودة التصنيع فاجأتني فعلاً — يبدو أنها بضعف سعرها.\"},{\"name\":\"عمر ك.\",\"location\":\"دبي\",\"rating\":5,\"title\":\"عمر البطارية حقيقي\",\"text\":\"أستخدمه أسبوعاً كاملاً قبل الشحن. الصوت نقي ومتوازن، والاقتران يستغرق ثانيتين فقط.\"},{\"name\":\"لينا ر.\",\"location\":\"تونس\",\"rating\":4,\"title\":\"قيمة رائعة وتصميم أنيق\",\"text\":\"يبدو جميلاً على مكتبي والتطبيق بسيط بشكل منعش. خدمة العملاء أجابت على سؤالي خلال ساعة.\"}]}', '2026-08-23 11:30:56', '2026-08-23 14:02:48'),
('testimonials_mode', 'default', '2026-08-23 13:51:14', '2026-08-23 14:17:14');

-- --------------------------------------------------------

--
-- Table structure for table `suppliers`
--

CREATE TABLE `suppliers` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `email_verified_at`, `password`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'New Admin', 'admin@portage.com', NULL, '$2y$12$hdInXhyuW7DBspWPgin8geKtEK8pvWPPP4n8H9/rog0jerrMHiTBy', NULL, '2026-08-23 08:09:10', '2026-08-23 08:09:10');

-- --------------------------------------------------------

--
-- Table structure for table `warranties`
--

CREATE TABLE `warranties` (
  `id` bigint UNSIGNED NOT NULL,
  `order_id` bigint UNSIGNED NOT NULL,
  `order_item_id` bigint UNSIGNED NOT NULL,
  `product_id` bigint UNSIGNED DEFAULT NULL,
  `serial_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `warranty_months` int UNSIGNED NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `brands`
--
ALTER TABLE `brands`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `brands_slug_unique` (`slug`);

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_expiration_index` (`expiration`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_locks_expiration_index` (`expiration`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `categories_slug_unique` (`slug`),
  ADD KEY `categories_parent_id_foreign` (`parent_id`);

--
-- Indexes for table `currencies`
--
ALTER TABLE `currencies`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `currencies_code_unique` (`code`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `customers_phone_unique` (`phone`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`),
  ADD KEY `failed_jobs_connection_queue_failed_at_index` (`connection`,`queue`,`failed_at`);

--
-- Indexes for table `inventory_batches`
--
ALTER TABLE `inventory_batches`
  ADD PRIMARY KEY (`id`),
  ADD KEY `inventory_batches_supplier_id_foreign` (`supplier_id`),
  ADD KEY `inventory_batches_product_id_arrival_date_index` (`product_id`,`arrival_date`);

--
-- Indexes for table `inventory_movements`
--
ALTER TABLE `inventory_movements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `inventory_movements_batch_id_foreign` (`batch_id`),
  ADD KEY `inventory_movements_created_by_foreign` (`created_by`),
  ADD KEY `inventory_movements_product_id_type_index` (`product_id`,`type`),
  ADD KEY `inventory_movements_reference_type_reference_id_index` (`reference_type`,`reference_id`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `newsletter_subscribers`
--
ALTER TABLE `newsletter_subscribers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `newsletter_subscribers_email_unique` (`email`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `orders_order_number_unique` (`order_number`),
  ADD KEY `orders_status_created_at_index` (`status`,`created_at`),
  ADD KEY `orders_source_index` (`source`),
  ADD KEY `orders_customer_id_index` (`customer_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_items_product_id_foreign` (`product_id`),
  ADD KEY `order_items_product_variant_id_foreign` (`product_variant_id`),
  ADD KEY `order_items_order_id_index` (`order_id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  ADD KEY `personal_access_tokens_expires_at_index` (`expires_at`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `products_sku_unique` (`sku`),
  ADD UNIQUE KEY `products_slug_unique` (`slug`),
  ADD KEY `products_brand_id_foreign` (`brand_id`),
  ADD KEY `products_status_is_featured_index` (`status`,`is_featured`),
  ADD KEY `products_category_id_index` (`category_id`);

--
-- Indexes for table `product_images`
--
ALTER TABLE `product_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_images_product_id_foreign` (`product_id`);

--
-- Indexes for table `product_prices`
--
ALTER TABLE `product_prices`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_prices_created_by_foreign` (`created_by`),
  ADD KEY `product_prices_product_id_valid_to_index` (`product_id`,`valid_to`);

--
-- Indexes for table `product_variants`
--
ALTER TABLE `product_variants`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_variants_product_id_foreign` (`product_id`);

--
-- Indexes for table `returns`
--
ALTER TABLE `returns`
  ADD PRIMARY KEY (`id`),
  ADD KEY `returns_order_id_foreign` (`order_id`),
  ADD KEY `returns_customer_id_foreign` (`customer_id`);

--
-- Indexes for table `return_items`
--
ALTER TABLE `return_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `return_items_return_id_foreign` (`return_id`),
  ADD KEY `return_items_order_item_id_foreign` (`order_item_id`),
  ADD KEY `return_items_product_id_foreign` (`product_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- Indexes for table `warranties`
--
ALTER TABLE `warranties`
  ADD PRIMARY KEY (`id`),
  ADD KEY `warranties_order_id_foreign` (`order_id`),
  ADD KEY `warranties_order_item_id_foreign` (`order_item_id`),
  ADD KEY `warranties_product_id_foreign` (`product_id`),
  ADD KEY `warranties_status_index` (`status`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `brands`
--
ALTER TABLE `brands`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `currencies`
--
ALTER TABLE `currencies`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `inventory_batches`
--
ALTER TABLE `inventory_batches`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `inventory_movements`
--
ALTER TABLE `inventory_movements`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `newsletter_subscribers`
--
ALTER TABLE `newsletter_subscribers`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `product_images`
--
ALTER TABLE `product_images`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `product_prices`
--
ALTER TABLE `product_prices`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `product_variants`
--
ALTER TABLE `product_variants`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `returns`
--
ALTER TABLE `returns`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `return_items`
--
ALTER TABLE `return_items`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `warranties`
--
ALTER TABLE `warranties`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `categories_parent_id_foreign` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `inventory_batches`
--
ALTER TABLE `inventory_batches`
  ADD CONSTRAINT `inventory_batches_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `inventory_batches_supplier_id_foreign` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `inventory_movements`
--
ALTER TABLE `inventory_movements`
  ADD CONSTRAINT `inventory_movements_batch_id_foreign` FOREIGN KEY (`batch_id`) REFERENCES `inventory_batches` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `inventory_movements_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `inventory_movements_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `order_items_product_variant_id_foreign` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variants` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_brand_id_foreign` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `products_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `product_images`
--
ALTER TABLE `product_images`
  ADD CONSTRAINT `product_images_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_prices`
--
ALTER TABLE `product_prices`
  ADD CONSTRAINT `product_prices_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `product_prices_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_variants`
--
ALTER TABLE `product_variants`
  ADD CONSTRAINT `product_variants_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `returns`
--
ALTER TABLE `returns`
  ADD CONSTRAINT `returns_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `returns_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `return_items`
--
ALTER TABLE `return_items`
  ADD CONSTRAINT `return_items_order_item_id_foreign` FOREIGN KEY (`order_item_id`) REFERENCES `order_items` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `return_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `return_items_return_id_foreign` FOREIGN KEY (`return_id`) REFERENCES `returns` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `warranties`
--
ALTER TABLE `warranties`
  ADD CONSTRAINT `warranties_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `warranties_order_item_id_foreign` FOREIGN KEY (`order_item_id`) REFERENCES `order_items` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `warranties_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
