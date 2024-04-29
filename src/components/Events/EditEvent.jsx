import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';

export default function EditEvent() {
  const navigate = useNavigate();
  const {id}  = useParams();


  const { data, isPending, isError, error } = useQuery({
    queryKey: ['events', id],
    queryFn: ({signal}) => fetchEventById({id}, {signal}),
  });

  const { mutate, isPending: isUpdatePending } = useMutation({
    mutationFn: updateEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      navigate('/events');
    },
  });


  function handleSubmit(formData) {
    mutate({ event: formData });
  }

  function handleClose() {
    navigate('../');
  }

  return (data && 
    <Modal onClose={handleClose}>
      <EventForm inputData={data} onSubmit={(formData) => handleSubmit(formData)}>
        <Link to="../" className="button-text">
          Cancel
        </Link>
        <button type="submit" className="button">
          Update
        </button>
      </EventForm>
    </Modal>
  );
}
