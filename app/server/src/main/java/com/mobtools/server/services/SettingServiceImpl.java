package com.mobtools.server.services;

import com.mobtools.server.domains.Setting;
import com.mobtools.server.repositories.SettingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.ReactiveMongoTemplate;
import org.springframework.data.mongodb.core.convert.MongoConverter;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Scheduler;

@Service
public class SettingServiceImpl extends BaseService<SettingRepository, Setting, String> implements SettingService {

    private final SettingRepository repository;

    @Autowired
    public SettingServiceImpl(Scheduler scheduler,
                              MongoConverter mongoConverter,
                              ReactiveMongoTemplate reactiveMongoTemplate,
                              SettingRepository repository) {
        super(scheduler, mongoConverter, reactiveMongoTemplate, repository);
        this.repository = repository;
    }

    @Override
    public Mono<Setting> getByKey(String key) {
        return repository.findByKey(key);
    }
}
