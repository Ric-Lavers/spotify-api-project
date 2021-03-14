import React, { useState, useEffect } from "react";

export const SavePlaylist = ({
  user_id,
  currentSort,
  currentPlaylist,
  createPlaylist,
  description: _description = ""
}) => {
  const [{ name, description, isPublic, collaborative }, setValues] = useState({
    name: currentPlaylist.name || "",
    description: _description,
    isPublic: false,
    collaborative: false
  });
  useEffect(() => {
    if (currentPlaylist.name)
      setValues(prev => ({
        ...prev,
        name: `${currentPlaylist.name || name}${
          currentSort ? ` (${currentSort})` : ""
        }`
      }));
  }, [currentPlaylist.name, currentSort]);

  const handleChange = ({ target: { name, value, checked } }) => {
    setValues(prev => ({
      ...prev,
      [name]: value === "on" ? checked : value
    }));
  };
  const [hadSuccess, setHadSuccess] = useState(false);
  const [hadError, setHadError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmitPlaylist = async e => {
    e.preventDefault();
    setLoading(true);
    const playlist = await createPlaylist({
      name,
      description,
      isPublic,
      collaborative
    });

    setLoading(false);
    if (playlist) {
      setHadSuccess(true);
      setTimeout(() => {
        setHadSuccess(false);
      }, 3000);
    } else {
      setHadError(true);
      setTimeout(() => {
        setHadError(false);
      }, 3000);
    }
  };

  return (
    <form
      onSubmit={handleSubmitPlaylist}
      onChange={handleChange}
      className="add-playlist"
    >
      <fieldset>
        <legend>Create new playlist</legend>
        <label>
          <span>Name</span>
          <input type="text" name="name" value={name} />
        </label>
        <label>
          <span>Description</span>
          <textarea
            type="textarea"
            name="description"
            rows="1"
            value={description}
          />
        </label>
        <label>
          <span>Public</span>
          <input name="isPublic" type="checkbox" checked={isPublic} />
        </label>
        <label>
          <span>Collaborative</span>
          <input name="collaborative" type="checkbox" checked={collaborative} />
        </label>
        <input type="submit" value="create new playlist" />
        {loading && "🤞"}
        {hadSuccess && "👍"}
        {hadError && "👎"}
      </fieldset>
    </form>
  );
};
