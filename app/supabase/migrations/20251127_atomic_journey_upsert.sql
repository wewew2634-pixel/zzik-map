-- Phase 1.4: 원자적 여정 패턴 upsert 함수
-- 경합 조건 방지를 위한 트랜잭션 기반 증가 연산

-- 1. journey_patterns 테이블에 unique constraint 추가 (없는 경우)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'journey_patterns_from_to_unique'
    ) THEN
        ALTER TABLE journey_patterns
        ADD CONSTRAINT journey_patterns_from_to_unique
        UNIQUE (from_location_id, to_location_id);
    END IF;
END $$;

-- 2. 원자적 upsert 함수 (INSERT ON CONFLICT 사용)
CREATE OR REPLACE FUNCTION upsert_journey_pattern(
    p_from_location_id UUID,
    p_to_location_id UUID
)
RETURNS TABLE (
    id UUID,
    from_location_id UUID,
    to_location_id UUID,
    journey_count INTEGER,
    action TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_id UUID;
    v_count INTEGER;
    v_action TEXT;
BEGIN
    -- INSERT ... ON CONFLICT로 원자적 upsert
    INSERT INTO journey_patterns (from_location_id, to_location_id, journey_count)
    VALUES (p_from_location_id, p_to_location_id, 1)
    ON CONFLICT (from_location_id, to_location_id)
    DO UPDATE SET
        journey_count = journey_patterns.journey_count + 1,
        updated_at = NOW()
    RETURNING
        journey_patterns.id,
        journey_patterns.journey_count,
        CASE
            WHEN xmax = 0 THEN 'created'
            ELSE 'incremented'
        END
    INTO v_id, v_count, v_action;

    RETURN QUERY SELECT
        v_id,
        p_from_location_id,
        p_to_location_id,
        v_count,
        v_action;
END;
$$;

-- 3. RLS 정책: 이 함수는 service role에서만 호출 가능
-- (SECURITY DEFINER로 설정되어 있어 RLS 우회)

-- 4. 인덱스 최적화 (from_location_id로 조회 빈번)
CREATE INDEX IF NOT EXISTS idx_journey_patterns_from_location
ON journey_patterns(from_location_id);

CREATE INDEX IF NOT EXISTS idx_journey_patterns_to_location
ON journey_patterns(to_location_id);

COMMENT ON FUNCTION upsert_journey_pattern IS
'Phase 1.4: 원자적 여정 패턴 upsert. 경합 조건 방지를 위해 INSERT ON CONFLICT 사용.';
