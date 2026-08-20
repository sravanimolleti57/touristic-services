import SearchAutocomplete from "./SearchAutocomplete";

export default function SearchBar({
  value,
  onChange,
  onSelect,
  onSubmit,
  onClear,
  placeholder = "Search destinations, hotels, or travel...",
  type = "all",
  localData = null,
  style = {}
}) {
  return (
    <SearchAutocomplete
      value={value}
      onChange={onChange}
      onSelect={onSelect}
      onSubmit={onSubmit}
      onClear={onClear}
      placeholder={placeholder}
      type={type}
      localData={localData}
      style={{ maxWidth: 600, width: "100%", ...style }}
    />
  );
}
