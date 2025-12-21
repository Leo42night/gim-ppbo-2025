<?php
// postfix _model agar tidak tabrakan dengan class di controller (keduanya bisa di require bersamaan)
class Project_model
{
    private $table = 'projects';
    private $db;

    public function __construct()
    {
        $this->db = new Database;
    }
    public function getAll()
    {
        $this->db->query('SELECT * FROM ' . $this->table);
        return $this->db->resultSet();
    }
    public function getById($id)
    {
        $this->db->query('SELECT * FROM ' . $this->table . " WHERE id = :id");
        $this->db->bind('id', $id);
        return $this->db->single();
    }

    public function getRatingProjects()
    {
        $this->db->query("
            SELECT 
                p.id AS project_id,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'rate', r.rate,
                        'count', r.total_raters,
                        'avatars', r.avatars
                    )
                ) AS ratings
            FROM projects p
            LEFT JOIN (
                SELECT
                    r.project_id,
                    r.rate,
                    COUNT(*) AS total_raters,
                    (
                        SELECT JSON_ARRAYAGG(u.picture)
                        FROM (
                            SELECT u.picture
                            FROM ratings r2
                            JOIN users u ON u.id = r2.user_id
                            WHERE r2.project_id = r.project_id
                            AND r2.rate = r.rate
                            ORDER BY r2.created_at DESC
                            LIMIT 3
                        ) u
                    ) AS avatars
                FROM ratings r
                GROUP BY r.project_id, r.rate
            ) r ON r.project_id = p.id
            GROUP BY p.id
            ORDER BY p.id;
        ");
        return $this->db->resultSet();
    }
}