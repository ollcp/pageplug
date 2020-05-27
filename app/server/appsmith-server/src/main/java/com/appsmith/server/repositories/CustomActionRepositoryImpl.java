package com.appsmith.server.repositories;

import com.appsmith.external.models.QActionConfiguration;
import com.appsmith.server.acl.AclPermission;
import com.appsmith.server.domains.Action;
import com.appsmith.server.domains.QAction;
import com.appsmith.server.domains.User;
import org.springframework.data.mongodb.core.ReactiveMongoOperations;
import org.springframework.data.mongodb.core.convert.MongoConverter;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Set;

import static org.springframework.data.mongodb.core.query.Criteria.where;

public class CustomActionRepositoryImpl extends BaseAppsmithRepositoryImpl<Action> implements CustomActionRepository {

    public CustomActionRepositoryImpl(ReactiveMongoOperations mongoOperations, MongoConverter mongoConverter) {
        super(mongoOperations, mongoConverter);
    }

    @Override
    public Mono<Action> findByNameAndPageId(String name, String pageId, AclPermission aclPermission) {
        Criteria nameCriteria = where(fieldName(QAction.action.name)).is(name);
        Criteria pageCriteria = where(fieldName(QAction.action.pageId)).is(pageId);

        return queryOne(List.of(nameCriteria, pageCriteria), aclPermission);
    }

    @Override
    public Flux<Action> findByPageId(String pageId, AclPermission aclPermission) {
        Criteria pageCriteria = where(fieldName(QAction.action.pageId)).is(pageId);
        return queryAll(List.of(pageCriteria), aclPermission);
    }

    @Override
    public Flux<Action> findDistinctActionsByNameInAndPageIdAndActionConfiguration_HttpMethod(Set<String> names,
                                                                                              String pageId,
                                                                                              String httpMethod,
                                                                                              AclPermission aclPermission) {
        Criteria namesCriteria = where(fieldName(QAction.action.name)).in(names);
        Criteria pageCriteria = where(fieldName(QAction.action.pageId)).is(pageId);
        String httpMethodQueryKey = fieldName(QAction.action.actionConfiguration)
                + "."
                + fieldName(QActionConfiguration.actionConfiguration.httpMethod);
        Criteria httpMethodCriteria = where(httpMethodQueryKey).is(httpMethod);
        List<Criteria> criterias = List.of(namesCriteria, pageCriteria, httpMethodCriteria);
        return ReactiveSecurityContextHolder.getContext()
                .map(ctx -> ctx.getAuthentication())
                .flatMapMany(auth -> {
                    User user = (User) auth.getPrincipal();
                    Query query = new Query();
                    criterias.stream()
                            .forEach(criteria -> query.addCriteria(criteria));
                    query.addCriteria(new Criteria().andOperator(notDeleted(), userAcl(user, aclPermission)));

                    return mongoOperations.findDistinct(query, fieldName(QAction.action.name),
                            Action.class, Action.class)
                            .map(action -> setUserPermissionsInObject(action, user));
                });
    }
}
