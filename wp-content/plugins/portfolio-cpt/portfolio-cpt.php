<?php
/**
 * Plugin Name: Portfolio CPT — Proyecto
 * Description: CPT proyecto + taxonomia categoria-proyecto + campos proyectoUrl/repoUrl/techStack expuestos en WPGraphQL como proyectoFields.
 * Version: 1.0.0
 * Author: Angel
 */

if (!defined('ABSPATH')) exit;

// 1) CPT proyecto
add_action('init', function () {
    register_post_type('proyecto', [
        'label' => 'Proyectos',
        'labels' => ['name' => 'Proyectos', 'singular_name' => 'Proyecto', 'add_new_item' => 'Añadir Proyecto'],
        'public' => true,
        'show_in_rest' => true,
        'show_in_graphql' => true,
        'graphql_single_name' => 'proyecto',
        'graphql_plural_name' => 'proyectos',
        'supports' => ['title', 'editor', 'excerpt', 'thumbnail', 'custom-fields'],
        'has_archive' => false,
        'rewrite' => ['slug' => 'proyecto'],
        'menu_icon' => 'dashicons-portfolio',
    ]);

    // 2) Taxonomia categoria-proyecto
    register_taxonomy('categoria-proyecto', ['proyecto'], [
        'label' => 'Categorías de Proyecto',
        'labels' => ['name' => 'Categorías', 'singular_name' => 'Categoría'],
        'public' => true,
        'show_in_rest' => true,
        'show_in_graphql' => true,
        'graphql_single_name' => 'categoriaProyecto',
        'graphql_plural_name' => 'categoriasProyecto',
        'hierarchical' => false,
        'rewrite' => ['slug' => 'categoria-proyecto'],
    ]);
});

// 3) Campos meta
add_action('init', function () {
    $auth = fn() => current_user_can('edit_posts');

    register_post_meta('proyecto', 'proyectoUrl', [
        'type' => 'string',
        'single' => true,
        'show_in_rest' => true,
        'show_in_graphql' => true,
        'graphql_single_name' => 'proyectoUrl',
        'description' => 'URL del deploy',
        'auth_callback' => $auth,
        'sanitize_callback' => 'sanitize_url',
    ]);

    register_post_meta('proyecto', 'repoUrl', [
        'type' => 'string',
        'single' => true,
        'show_in_rest' => true,
        'show_in_graphql' => true,
        'graphql_single_name' => 'repoUrl',
        'description' => 'URL del repositorio',
        'auth_callback' => $auth,
        'sanitize_callback' => 'sanitize_url',
    ]);

    register_post_meta('proyecto', 'techStack', [
        'type' => 'string',
        'single' => true,
        'show_in_rest' => true,
        'show_in_graphql' => true,
        'graphql_single_name' => 'techStack',
        'description' => 'Tech stack JSON array, ej: ["Astro","Tailwind"]',
        'auth_callback' => $auth,
        'sanitize_callback' => fn($v) => is_string($v) ? wp_kses_post($v) : $v,
    ]);
});

// 4) WPGraphQL: agrupar en proyectoFields { proyectoUrl repoUrl techStack }
add_action('graphql_register_types', function () {
    if (!function_exists('register_graphql_object_type') || !function_exists('register_graphql_field')) return;

    register_graphql_object_type('ProyectoFields', [
        'description' => 'Campos custom de Proyecto',
        'fields' => [
            'proyectoUrl' => ['type' => 'String', 'description' => 'URL deploy'],
            'repoUrl'     => ['type' => 'String', 'description' => 'URL repo'],
            'techStack'   => ['type' => ['list_of' => 'String'], 'description' => 'Tecnologías'],
        ],
    ]);

    register_graphql_field('Proyecto', 'proyectoFields', [
        'type' => 'ProyectoFields',
        'description' => 'Grupo de campos custom',
        'resolve' => function ($post) {
            $id = $post->ID ?? $post->databaseId ?? 0;
            if (!$id && isset($post->ID)) $id = (int) $post->ID;
            $raw = get_post_meta($id, 'techStack', true);
            $tech = [];
            if ($raw) {
                $decoded = json_decode($raw, true);
                if (is_array($decoded)) $tech = $decoded;
                else $tech = array_filter(array_map('trim', explode(',', (string) $raw)));
            }
            return [
                'proyectoUrl' => get_post_meta($id, 'proyectoUrl', true) ?: null,
                'repoUrl'     => get_post_meta($id, 'repoUrl', true) ?: null,
                'techStack'   => $tech,
            ];
        },
    ]);
});

// 5) Seed de términos al activar + fallback en init (por si activation se ejecuta antes de registrar taxonomía)
register_activation_hook(__FILE__, function () {
    foreach (['Frontend','Backend','Fullstack','Mobile','Otro'] as $term) {
        if (!term_exists($term, 'categoria-proyecto')) {
            wp_insert_term($term, 'categoria-proyecto', ['slug' => sanitize_title($term)]);
        }
    }
});

// Fallback: asegura términos en cada init si faltan (idempotente)
add_action('init', function () {
    if (!taxonomy_exists('categoria-proyecto')) return;
    foreach (['Frontend','Backend','Fullstack','Mobile','Otro'] as $term) {
        if (!term_exists($term, 'categoria-proyecto')) {
            wp_insert_term($term, 'categoria-proyecto', ['slug' => sanitize_title($term)]);
        }
    }
}, 20);
