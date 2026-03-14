-- Compute product forecasts using weighted moving average
-- Recent weeks get higher weight for trend-sensitive forecasting
CREATE OR REPLACE FUNCTION get_product_forecasts(
  p_history_weeks integer DEFAULT 12,
  p_forecast_days integer DEFAULT 14
)
RETURNS TABLE (
  product_id uuid,
  product_name text,
  sku text,
  carton_size integer,
  price numeric,
  avg_daily_sales numeric,
  forecast_units integer,
  forecast_cases integer,
  forecast_remainder integer,
  duty_days_count bigint,
  total_units_sold bigint
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY
  WITH duty_day_data AS (
    SELECT
      ds.product_id,
      ds.units_sold,
      GREATEST(1, CEIL((CURRENT_DATE - ds.sale_date)::numeric / 7))::integer as week_num
    FROM daily_sales ds
    WHERE ds.sale_date >= CURRENT_DATE - (p_history_weeks * 7)
      AND ds.is_duty_day = true
  ),
  weighted_avg AS (
    SELECT
      d.product_id,
      ROUND(
        SUM(d.units_sold::numeric * (p_history_weeks + 1 - d.week_num)) /
        NULLIF(SUM(p_history_weeks + 1 - d.week_num), 0),
        2
      ) as w_avg_daily,
      COUNT(*) as duty_days,
      SUM(d.units_sold) as total_sold
    FROM duty_day_data d
    GROUP BY d.product_id
  )
  SELECT
    p.id,
    p.name,
    p.sku,
    p.carton_size,
    p.price,
    COALESCE(w.w_avg_daily, 0),
    COALESCE(CEIL(w.w_avg_daily * p_forecast_days), 0)::integer,
    CASE
      WHEN p.carton_size IS NOT NULL AND p.carton_size > 0
      THEN COALESCE(CEIL(w.w_avg_daily * p_forecast_days), 0)::integer / p.carton_size
      ELSE 0
    END,
    CASE
      WHEN p.carton_size IS NOT NULL AND p.carton_size > 0
      THEN COALESCE(CEIL(w.w_avg_daily * p_forecast_days), 0)::integer % p.carton_size
      ELSE COALESCE(CEIL(w.w_avg_daily * p_forecast_days), 0)::integer
    END,
    COALESCE(w.duty_days, 0),
    COALESCE(w.total_sold, 0)
  FROM products p
  LEFT JOIN weighted_avg w ON w.product_id = p.id
  WHERE p.is_active = true
  ORDER BY COALESCE(w.total_sold, 0) DESC;
END;
$$;

-- Get actual sales for the most recent N duty days per product (for forecast vs actual comparison)
CREATE OR REPLACE FUNCTION get_actual_sales(
  p_days integer DEFAULT 14
)
RETURNS TABLE (
  product_id uuid,
  actual_units bigint,
  actual_duty_days bigint
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY
  WITH recent_duty_dates AS (
    SELECT DISTINCT sale_date
    FROM daily_sales
    WHERE is_duty_day = true
    ORDER BY sale_date DESC
    LIMIT p_days
  )
  SELECT
    ds.product_id,
    SUM(ds.units_sold)::bigint,
    COUNT(DISTINCT ds.sale_date)::bigint
  FROM daily_sales ds
  INNER JOIN recent_duty_dates rd ON rd.sale_date = ds.sale_date
  GROUP BY ds.product_id;
END;
$$;

-- Grant access to authenticated users
GRANT EXECUTE ON FUNCTION get_product_forecasts(integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION get_actual_sales(integer) TO authenticated;
