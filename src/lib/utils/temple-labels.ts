import { m } from '$lib/paraglide/messages';

/** Backend enums are open: an unknown value yields `undefined` so the UI can skip the badge. */
const RANK_LABELS: Record<string, () => string> = {
	DI_SAN_THE_GIOI: () => m.temple_rank_world_heritage(),
	DI_TICH_QUOC_GIA_DAC_BIET: () => m.temple_rank_special_national(),
	KHU_DU_LICH_QUOC_GIA: () => m.temple_rank_national_tourist_area(),
	DI_TICH_QUOC_GIA: () => m.temple_rank_national(),
	DANH_LAM_THANG_CANH: () => m.temple_rank_scenic_landscape(),
	DI_TICH_CAP_TINH: () => m.temple_rank_provincial(),
	DI_TICH_CAP_THANH_PHO: () => m.temple_rank_city(),
	CHUA_XEP_HANG: () => m.temple_rank_unranked()
};

const SECT_LABELS: Record<string, () => string> = {
	BẮC_TÔNG: () => m.temple_sect_mahayana(),
	TRUC_LAM_YEN_TU: () => m.temple_sect_truc_lam(),
	KHAT_SI: () => m.temple_sect_khat_si(),
	NAM_TONG_KHMER: () => m.temple_sect_khmer_theravada(),
	HOA_TONG: () => m.temple_sect_hoa(),
	NAM_TONG: () => m.temple_sect_theravada(),
	TIN_NGUONG_DANG_GIAN: () => m.temple_sect_folk(),
	MINH_SU_DAO: () => m.temple_sect_minh_su()
};

export const templeRankLabel = (rank: string): string | undefined => RANK_LABELS[rank]?.();
export const templeSectLabel = (sect: string): string | undefined => SECT_LABELS[sect]?.();
